/*!
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * @package       Bancha
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @since         Bancha v 2.0.0
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha v 2.4.0
 *
 * For more information go to http://bancha.io
 */

/**
 * @class Bancha.data.Model
 * @extends Ext.data.Model
 *
 * This should only be used by Bancha internally,
 * since it just has an additional flag to force consistency in Bancha.
 *
 * @author Roland Schuetz <mail@rolandschuetz.at>
 * @docauthor Roland Schuetz <mail@rolandschuetz.at>
 */
Ext.define('Bancha.data.Model', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.direct.Manager',
        'Bancha.Main',
        'Bancha.data.override.NodeInterface',
        'Bancha.data.writer.ConsistentJson',
        'Bancha.Remoting'
    ],

    /**
     * @cfg {Boolean|String}
     * If you are using Bancha with Sencha Architect, setting this to truthy will tell
     * Bancha to set all fields, validation rules, associations and the proxy based
     * on the CakePHP model.
     * If your model is inside a plugin, please set this value to the full name, e.g.
     * "MyPlugin.MyModel"
     */
    bancha: false,

    /**
     * Retrieve the displayField, originally set from CakePHP model configuration.
     * @param {String|Null} The current display field value
     */
    getDisplayField: function() {
        // to access the value from a record directly
        if(Ext.versions.extjs && Ext.versions.extjs.major === 4) {
            // For Ext JS 4
            return this.displayField;
        } else {
            // For Ext JS 5 and Sencha Touch
            return this.self.displayField;
        }
    },

    /**
     * @private
     * For Ext JS:
     * Every time a new subclass is created, this function will apply all Bancha model configurations.
     *
     * In the debug version it will raise an Ext.Error if the model can't be
     * or is already created, in production it will only return false.
     *
     * Reasons why it can't work like Sencha Touch:
     *  - Since Ext JS does not have setters for associations we need to set it as data before.
     *  - Since Ext JS's onBeforeClassCreated retrieved the proxy data BEFORE the postprocessor
     *    is executed, but applied AFTER it the proxy can't be set there. So we need to set the
     *    proxy this way.
     */
    onClassExtended: function(cls, data, hooks) {

        // only apply this for Ext JS,
        // see Ext.ClassManager.registerPostprocessor below for Sencha Touch
        if(Ext.versions.touch) {
            return;
        }

        // Support for Ext JS 4.0.7
        var me = this;
        if(typeof me.applyCakeSchema !== 'function') {
            // In Ext JS 4.1+ the scope is the Bancha.data.Model,
            // In Ext JS 4.0 the scope is the newly created class, fix this
            me = Ext.ClassManager.get('Bancha.data.Model');
        }

        // Apply the schema for Ext JS 4 and 5
        me.applyCakeSchema(cls, data);

        // Legacy Support for Ext JS 4.0
        // Ext JS 4.1+ applies onClassExtended methods of superclasses and super-superclasses and so on,
        // the whole inheritance chain up.
        // Ext JS 4.0 applies the method only to the immediate subclasses, but not child-child classes.
        // Normalize to the new behavior
        if(Ext.versions.extjs && Ext.versions.extjs.shortVersion < 410) {
            // If we wouldn't call it here the Ext.data.Model#onClassExtended would only be applied to
            // Bancha.data.Model, but not to it's childs. With the sequence we get the expeceted behavior.
            Ext.data.Model.prototype.$onExtended.apply(this, arguments);
        }
    },

    statics: {
        /**
         * @private
         * This function applies all the Bancha model configurations from the
         * cakephp models.
         *
         * In the debug version it will raise an Ext.Error if the model can't be
         * or is already created, in production it will only return false.
         *
         * @param {String} modelCls The model to augment
         * @param {Object} extJsOnClassExtendedData If this is executed from an Ext JS context
         *                                          this is the data argument from onClassExtended
         * @param {String|undefined} modelName (optional) The model name, may be enforced from models bancha property
         * @return void
         */
        applyCakeSchema: function(modelCls, extJsOnClassExtendedData, modelName) {
            var config;

            if(!modelName && Bancha.modelNamespace+'.'===modelCls.getName().substr(0, Bancha.modelNamespace.length+1)) {
                // this is a default Bancha integration (not Sencha Architect)
                // get the CakePHP model name by removing the namespace, e.g. "User"
                modelName = modelCls.getName().substr(Bancha.modelNamespace.length+1);
            }
            if(!modelName) {
                // since the namespace don't match, this is a Sencha Architect integration
                // with a plugin-free model name
                modelName = modelCls.getName().split('.').pop();
            }

            if(!Bancha.initialized) {
                Bancha.init();
            }

            if(!Bancha.isRemoteModel(modelName)) {
                //<debug>
                
                
                Ext.Error.raise({
                    plugin: 'Bancha',
                    msg: 'Bancha Basic does not allow to expose models, please use Bancha Pro.'
                });
                
                //</debug>
                return false;
            }

            if(!Bancha.modelMetaDataIsLoaded(modelName)) {
                //<debug>
                
                //</debug>
                return false;
            }

            //<debug>
            if(!Ext.isDefined(Bancha.getModelMetaData(modelName).idProperty)) {
                if(Ext.global.console && Ext.isFunction(Ext.global.console.warn)) {
                    Ext.global.console.warn(
                        'Bancha: The model meta data for '+modelName+' seems strange, probably this was '+
                        'not created by Bancha, or an error occured on the server-side. Please notice '+
                        'that this warning is only created in debug mode.');
                }
            }
            //</debug>

            // add all class statics for Bancha models
            modelCls.addStatics(this.extendedClassStatics);

            // for Ext JS configure the schema namespace
            if(Ext.versions.extjs && Ext.versions.extjs.major===5 && modelCls.schema) {
                modelCls.schema.setNamespace(Bancha.modelNamespace);
            }

            // configure the new model
            config = Bancha.getModelMetaData(modelName);

            // default case for Ext JS 4 and Sencha Touch
            if(typeof modelCls.setFields === 'function') {
                modelCls.setFields(config.fields);
            }
            if(Ext.versions.extjs) {
                // this is used for three cases:
                // - Support for Ext JS 4.0.7
                // - Ext JS Support for ScriptTagInitializer, where we hook into Ext.data.Model extend
                // - Ext JS 5 support with the microloader
                extJsOnClassExtendedData.fields = config.fields;
            }
            // Ext JS 5 fields are handled in a seperate function at the end of the file

            if(Ext.versions.touch) {
                modelCls.setAssociations(config.associations);
                modelCls.setIdProperty(config.idProperty);
                modelCls.setValidations(config.validations);
                modelCls.setDisplayField(config.displayField);
            } else {
                extJsOnClassExtendedData.associations = config.associations;
                extJsOnClassExtendedData.idProperty = config.idProperty;
                extJsOnClassExtendedData.validations = config.validations;
                if(Ext.versions.extjs.major === 4 ) {
                    extJsOnClassExtendedData.displayField = config.displayField;
                } else {
                    modelCls.displayField = config.displayField;
                }
            }

            // set the Bancha proxy
            modelCls.setProxy(this.createBanchaProxy(modelCls, modelName));
        },

        /**
         * @private
         * The following configs should be available on a per-model basis,
         * therefore these statics are added to each extended class
         */
        extendedClassStatics: {
            /**
             * @cfg
             * If set to true, Bancha will enforce consisteny for your clients actions.
             * This prevents duplicated requests and race conditions, for more see
             * http://bancha.io/documentation-pro-models-consistent-transactions.html
             *
             * This is a static config and can be set on a per-model base.
             */
            forceConsistency: false,
            /**
             * Retrieve if consistency is currently enforced for this model.
             * @return {Boolean} True to enforce consistency
             */
            getForceConsistency: function() {
                // this function exists for support of all Ext JS 4 versions
                return this.forceConsistency;
            },
            /**
             * Change if consistency is currently enforced for this model.
             * @param {Boolean} forceConsistency True to enforce consistency
             */
            setForceConsistency: function(forceConsistency) {
                // this function exists for support of all Ext JS 4 versions
                this.forceConsistency = forceConsistency;
            },
            /**
             * @cfg {String|Null}
             * Bancha automatically sets the displayField, retrieved from the
             * CakePHP model configuation on a per model-bases.
             * Null, if no displayField is set.
             */
            displayField: null,
            /**
             * Retrieve the displayField, originally set from CakePHP model configuration.
             * @param {String|Null} The current display field value
             */
            getDisplayField: function() {
                // this function exists for support of all Ext JS 4 versions
                return this.displayField;
            },
            /**
             * Change the displayField.
             * @param {String|Null} displayField The new display field value
             */
            setDisplayField: function(displayField) {
                // this function exists for support of all Ext JS 4 versions
                this.displayField = displayField;
            }
        },

        /**
         * @private
         * To display nicer debugging messages, in debug mode this returns
         * a fake function if the stub method doesn't exist.
         *
         * In production mode it simply returns the original function or null.
         *
         * @param  {Object} stub      Ext.Direct stub
         * @param  {String} method    Sencha method name
         * @param  {String} modelName The CakePHP model name
         * @return {Function|null}
         */
        getStubMethod: function(stub, method, modelName) {
            if(Ext.isDefined(stub[method] && typeof stub[method] === 'function')) {
                return stub[method];
            }

            var fakeFn = null;

            //<debug>
            // function doesn't exit, create fake which will throw an error on first use
            var map = {
                create : 'add',
                read   : 'view or index',
                update : 'edit',
                destroy: 'delete'
            };
            fakeFn = function() {
                Ext.Error.raise({
                    plugin: 'Bancha',
                    modelName: modelName,
                    msg: [
                        'Bancha: Tried to call '+modelName+'.'+method+'(...), ',
                        'but the server-side has not implemented ',
                        modelName+'sController->'+ map[method]+'(...). ',
                        '(If you have special inflection rules, the server-side ',
                        'is maybe looking for a different controller name, ',
                        'this is just a guess)'
                    ].join('')
                });
            };

            // this is not part of the official Ext API!, but it seems to be necessary to do this for better bancha debugging
            fakeFn.directCfg = { // TODO testen
                len: 1,
                name: method,
                formHandler: false
            };
            // fake the execution method
            fakeFn.directCfg.method = fakeFn;
            fakeFn.getArgs = fakeFn;
            //</debug>

            return fakeFn;
        },
        createBanchaProxy: function(model, modelName) {
            var stub,
                configWithRootPropertySet;

            // Sencha Touch uses the new rootProperty property for configuring the reader and writer
            // Ext JS 5 used the rootProperty as well.
            // Ext JS 4 still uses root.
            // This all would be fine, but now Sencha Touch throws deprecated warning for using the old
            // Ext JS syntax, so we can't just assign both anymore, instead we need to create a config
            // prototype here
            if(Ext.versions.touch || (Ext.versions.extjs && Ext.versions.extjs.major >= 5)) {
                configWithRootPropertySet = {
                    rootProperty: 'data'
                };
            } else {
                configWithRootPropertySet = {
                    root: 'data'
                };
            }

            // create the metadata
            stub = Bancha.getStub(modelName);
            return { // the proxy configuration
                type: 'direct', // TODO batch requests: http://www.sencha.com/forum/showthread.php?156917
                // don't batch requests on the store level, they will be batched
                // by Ext.Direct on the application level
                batchActions: false,
                api: {
                    read    : this.getStubMethod(stub,'read',modelName),
                    create  : this.getStubMethod(stub,'create',modelName),
                    update  : this.getStubMethod(stub,'update',modelName),
                    destroy : this.getStubMethod(stub,'destroy',modelName)
                },
                // because of an error in ext the following directFn def. has to be
                // defined, which should be read from api.read instead...
                // see http://www.sencha.com/forum/showthread.php?134505&p=606283&viewfull=1#post606283
                directFn: this.getStubMethod(stub,'read',modelName),
                reader: Ext.apply({
                    type: 'json',
                    messageProperty: 'message'
                }, configWithRootPropertySet),
                writer: Ext.apply({
                    type: 'consitentjson',
                    writeAllFields: false // false to optimize data transfer
                }, configWithRootPropertySet),
                listeners: {
                    exception: Bancha.Remoting.getFacade('onRemoteException')
                }
            };
        } //eo getBanchaProxy
    } //eo statics
}, function() {
    var me = this;

    if(Ext.versions.extjs && Ext.versions.extjs.major === 5) {
        // For Ext JS 5 it's important that we are the first applied onExtended function
        var onExtendedFn = me.$onExtended.pop(); // see onClassExtended
        me.$onExtended.unshift(onExtendedFn); // add as first element

        // Since Ext JS 5 has already automatically created an id field
        // replace it with our fields
        me.onExtended(function (cls, data) {
            var modelName = false,
                modelCls = cls,
                config;
            if(!modelName && Bancha.modelNamespace+'.'===modelCls.getName().substr(0, Bancha.modelNamespace.length+1)) {
                // this is a default Bancha integration (not Sencha Architect)
                // get the CakePHP model name by removing the namespace, e.g. "User"
                modelName = modelCls.getName().substr(Bancha.modelNamespace.length+1);
            }
            if(!modelName) {
                // since the namespace don't match, this is a Sencha Architect integration
                // with a plugin-free model name
                modelName = modelCls.getName().split('.').pop();
            }

            if(!Bancha.isRemoteModel(modelName)) {
                //<debug>
                
                
                Ext.Error.raise({
                    plugin: 'Bancha',
                    msg: 'Bancha Basic does not allow to expose models, please use Bancha Pro.'
                });
                
                //</debug>
                return false;
            }

            // configure the new model
            config = Bancha.getModelMetaData(modelName);
            modelCls.replaceFields(config.fields, true);
            
            // fixes strange bug that fieldsMap is not set correctly
            modelCls.prototype.fieldsMap = modelCls.fieldsMap;
        });
    }

    if(!Ext.versions.touch) {
        return; // nothing to do for Ext JS, see onClassExtended
    }

    /*
     * For Sencha Touch:
     *
     * Every time a new subclass is created, this function will apply all
     * Bancha model configurations.
     *
     * In the debug version it will raise an Ext.Error if the model can't be
     * or is already created, in production it will only return false.
     */
    Ext.ClassManager.registerPostprocessor('banchamodelfromnamespace', function(name, cls, data) {
        var ns = (Bancha.modelNamespace+'.' || 'Bancha.model.');
        if(name.substr(0, ns.length) !== ns) {
            return true; // not a Bancha model
        }
        me.applyCakeSchema(cls);
    }, true);
});

/*!
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * Tests for the Bancha.loader.Proxy class
 *
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha v 2.4.0
 *
 * For more information go to http://bancha.io
 */

describe("Bancha.loader.Models", function() {
    var loader = Bancha.loader.Models;

    it("should handle only and all Bancha models.", function() {
        expect(loader.handles('Bancha.model.LoaderTestModel1')).toBeTruthy();
        expect(loader.handles('Bancha.bla.LoaderTestModel1')).toBeFalsy();
        expect(loader.handles('MyApp.model.LoaderTestModel1')).toBeFalsy();
    });

    var scope = {
            scoped: false,
            onLoad: function() {
                this.scoped = true;
            },
            onError: function() {
                this.scoped = true;
            }
        };

    it("should simply instanciate already loaded models.", function() {
        // prepare
        var isLoadedFn = spyOn(Bancha, 'modelMetaDataIsLoaded').andReturn(true),
            resultClassName = '',
            getLoadedModelFn = spyOn(Bancha, 'getLoadedModel').andCallFake(function(className) {
                Ext.define('Bancha.model'+className, {});
                resultClassName = className;
            }),
            onLoad = spyOn(scope, 'onLoad').andCallThrough(),
            onError = spyOn(scope, 'onError').andCallThrough();

        // test
        loader.loadClass('Bancha.model.ModelLoaderTestModel1', onLoad, onError, scope, false);

        // check execution
        expect(isLoadedFn).toHaveBeenCalled();
        expect(getLoadedModelFn).toHaveBeenCalled();

        // check that the classname was not manipulated
        expect(resultClassName).toEqual('ModelLoaderTestModel1');

        // check callbacks
        expect(onLoad).toHaveBeenCalled();
        expect(onError.callCount).toEqual(0);

        // check scope
        expect(scope.scoped).toEqual(true);
    });

    it("should load required models (sync and async logic only differs in Bancha#getloadModelMetaData).", function() {
        // prepare
        var resultClassName = '',
            getLoadedModelFn = spyOn(Bancha, 'getLoadedModel').andCallFake(function(className) {
                Ext.define('Bancha.model'+className, {});
                resultClassName = className;
            }),
            loadFn = spyOn(Bancha, 'loadModelMetaData'),
            onLoad = spyOn(scope, 'onLoad').andCallThrough(),
            onError = spyOn(scope, 'onError').andCallThrough();

        // Fake that Bancha is already initialized, but the model is not loaded yet
        Bancha.initialized = true;

        // test
        loader.loadClass('Bancha.model.ModelLoaderTestModel2', onLoad, onError, scope, false);

        // class is not yet "loaded"
        expect(onLoad.callCount).toEqual(0);
        expect(onError.callCount).toEqual(0);
        expect(getLoadedModelFn.callCount).toEqual(0);

        // get correct load parameters
        expect(loadFn).toHaveBeenCalled();
        expect(loadFn.mostRecentCall.args[0]).toEqual(['ModelLoaderTestModel2']);
        expect(loadFn.mostRecentCall.args[1]).toBeAFunction(); //callback
        expect(loadFn.mostRecentCall.args[2]).toBeAnObject(); // scope
        expect(loadFn.mostRecentCall.args[3]).toEqual(false); //syncMode

        // now trigger loaded
        loadFn.mostRecentCall.args[1].call(loadFn.mostRecentCall.args[2],true,'');

        // check execution
        expect(getLoadedModelFn).toHaveBeenCalled();

        // check that the classname was not manipulated
        expect(resultClassName).toEqual('ModelLoaderTestModel2');

        // check callbacks
        expect(onLoad).toHaveBeenCalled();
        expect(onError.callCount).toEqual(0);

        // check scope
        expect(scope.scoped).toEqual(true);
    });

});

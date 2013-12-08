<?php
/**
 * Bancha Project : Seamlessly integrates CakePHP with ExtJS and Sencha Touch (http://banchaproject.org)
 * Copyright 2011-2013 codeQ e.U.
 *
 * @package       Bancha.Controller.Component
 * @copyright     Copyright 2011-2013 codeQ e.U.
 * @link          http://banchaproject.org Bancha Project
 * @since         Bancha v 1.1.0
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 */

App::uses('PaginatorComponent', 'Controller/Component');
App::uses('BanchaException', 'Bancha.Bancha/Exception');

/**
 * BanchaPaginatorComponent
 *
 * This class extends the default Paginator component to also support
 * remote filtering from inside any ExtJS/Sencha Touch store with
 * remoteFiltering:true and a Bancha model.
 *
 * @package       Bancha.Controller.Component
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 */
class BanchaPaginatorComponent extends PaginatorComponent {

/**
 * Define here on which fields it's allowed to filter data.
 * In cakephp debugging mode with the Bancha dev version, Bancha will
 * display an error if you are filtering for unallowed filter
 *
 *
 * Possible options:
 *  - 'all'
 *     Please choose wisely, defining 'all' could lead to potenzial
 *     security issues since hackers could expose more data then
 *     expected with standard MySQL-like attacks. E.g. filtering
 *     by password with regex or filtering other hidden information.
 *
 *  - 'associations'
 *    This exposes only fields where there is an association defined
 *    in the model, so for article belongsTo user filtering by user_id
 *    is allowed.
 *
 *  - array('User.field1', 'User.field2')
 *    You can specifically define which fields you want to allow f
 *    iltering upon.
 *    Note that array('field1', 'field2') is only allowed when using 
 *    the setter method.
 *
 *  - 'none' -> This will be internally transformed to an empty array
 *    No filtering is allowed.
 *
 */
	public $allowedFilters = 'associations';

/**
 * A reference to the instantiating controller object.
 * @var Controller class
 */
	protected $_Controller;

/**
 * Pagination settings for Bancha requests. These settings control pagination at a general level.
 *
 * These will override the default PaginatorComponent::$setting settings for Bancha requests.
 *
 * Default changes:
 *
 * - `maxLimit` The maximum limit is in normal requests set to 100, for Bancha requests we set a maximum of 1000
 *
 * @var array
 */
	public $banchaSettings = array(
		'maxLimit' => 1000
	);

/**
 * Constructor
 *
 * @param ComponentCollection $collection A ComponentCollection this component can use to lazy load its components
 * @param array $settings Array of configuration settings.
 */
	public function __construct(ComponentCollection $collection, array $settings = array()) {
		$this->_Controller = $collection->getController();
		parent::__construct($collection, $settings);
	}

/**
 * The initialize method fixes a conflict with the RequestHandler.
 *
 * The RequestHandler would overwrite the by Bancha set $request->data property
 * to the whole Ext.Direct json data, instead of the correct request data only.
 *
 * So every time the request is made by Bancha we will disable the RequestHandler,
 * if available.
 *
 * @param  Controller $Controller Controller with components to initialize
 * @return void
 */
	public function initialize(Controller $Controller) {
		if(!isset($Controller->request->params['isBancha']) || !$Controller->request->params['isBancha']) {
			// this is not a Bancha request, so nothing for us to do here
			return;
		}

		// If there is a RequestHandler, deactivate all callbacks
		if(isset($Controller->RequestHandler)) {
			$Controller->Components->disable('RequestHandler');
		}

		// If there is a AuthComponent, missing rights should trigger a redirect, not a rendering
		if(isset($Controller->Auth)) {
			$Controller->Auth->ajaxLogin = null;
		}
	}
/**
 * Main execution method. Handles validating of allowed filter constraints.
 *
 * @param Controller $Controller A reference to the instantiating controller object
 * @throws BanchaException
 * @return void
 */
	public function startup(Controller $Controller) {
		if(!isset($Controller->request->params['isBancha']) || !$Controller->request->params['isBancha']) {
			// this is not a Bancha request, so nothing for us to do here
			return;
		}

		// set the controller-specific options if defined
		$this->_setSettings($this->settings);
	}

/**
 * Handles automatic pagination of model records.
 *
 * The BanchaPaginatorComponents extends the default
 * behavior by supporting remote filtering on Bancha
 * requests if the allowedFilters config allows it.
 *
 * @param mixed $object Model to paginate (e.g: model instance, or 'Model', or 'Model.InnerModel')
 * @param mixed $scope Additional find conditions to use while paginating
 * @param array $whitelist List of allowed fields for ordering.  This allows you to prevent ordering
 *   on non-indexed, or undesirable columns.
 * @return array Model query results
 * @throws MissingModelException
 * @throws BanchaException
 */
    public function paginate($object = null, $scope = array(), $whitelist = array()) {

    	// bancha-specific access-restriction logic
		if(isset($this->_Controller->request->params['isBancha']) && $this->_Controller->request->params['isBancha']) {

			// apply the Bancha default settings
			$this->settings = array_merge($this->settings, $this->banchaSettings);

			// debug warning
			if(Configure::read('debug')==2 && isset($this->_Controller->request->params['named']['limit']) &&
				$this->settings['maxLimit']<$this->_Controller->request->params['named']['limit']) {
				throw new BanchaException(sprintf(
					'The pageSize(%u) you set is bigger then the maxLimit(%u) set in CakePHP.', 
					$this->_Controller->request->params['named']['limit'],
					$this->settings['maxLimit']));
			}

			
			/**
			 * Bancha Basic does not allow pagination.
			 *
			 * Yes, if you want to hack this software, it is pretty simply. We want
			 * to spend our time making Bancha even better, not adding piracy
			 * protection.
			 *
			 * Please consider buying a license if you like Bancha, we are a
			 * small company and if we don't earn money to life from this project
			 * we are not able to further develop Bancha.
			 */
			// We place this here instead of in the RequestTransformer to make
			// sure the other requests ares till handled correctly and that we
			// return an Ext.Direct response.
			if(Configure::read('Bancha.isPro')==false && $this->_Controller->request->named['page']>1) {
				throw new BanchaException(
					'Bancha Basic does not support pagiantion. <br>'.
					'If you need advanced features, please consider buying Bancha Pro.'
				);
			}
			if(Configure::read('Bancha.isPro')==false && !empty($this->_Controller->request->named['conditions'])) {
				throw new BanchaException(
					'Bancha Basic does not support remote filtering of data. <br>'.
					'If you need advanced features, please consider buying Bancha Pro.'
				);
			}
			
			
		}


		return parent::paginate($object, $scope, $whitelist);
	}

/**
 * Attempts to introspect the correct values for object properties.
 * 
 * @param Array $settings An array of configuratuions for this component
 * @throws BanchaException
 * @return void
 */
	protected function _setSettings(array $settings) {

		// override defaults by component configs
		foreach ($settings as $key => $value) {
			if(property_exists($this, $key)) {
				$this->{$key} = $value; // override
			}
		}

		
	}

/**
 * Change the allowedFilter at run-time. This function will santizise and may throw an
 * error if the configuration is malformed.
 * @param string/string[] $allowedFilters the new value for the allowedFilters property
 * @throws BanchaException
 * @return void
 */
	public function setAllowedFilters($allowedFilters) {

		
		/**
		 * Bancha Basic does not allow filtering.
		 *
		 * Yes, if you want to hack this software, it is pretty simply. We want
		 * to spend our time making Bancha even better, not adding piracy
		 * protection.
		 *
		 * Please consider buying a license if you like Bancha, we are a
		 * small company and if we don't earn money to life from this project
		 * we are not able to further develop Bancha.
		 */
		if(Configure::read('Bancha.isPro')==false) {
			throw new BanchaException(
				'Bancha Basic does not support remote filtering of data, therefore using '.
				'$this->Paginator->setAllowedFilters is not possible. <br>'.
				'If you need advanced features, please consider buying Bancha Pro.'
			);
		}
		

		
	}


}

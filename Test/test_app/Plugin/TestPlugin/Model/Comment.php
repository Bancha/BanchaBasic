<?php
/**
 * Plugin model for testing purposes
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * @package       Bancha.Test.Case.System
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @since         Bancha v 2.1.0
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 */

/**
 * Plugin model for testing purposes
 *
 * @package       Bancha.Test.test_app.Plugin.TestPlugin.Model
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @since         Bancha v 2.1.0
 */
class Comment extends TestPluginAppModel {

	public $actsAs = array('Bancha.BanchaRemotable');

	public $useTable = false;

	protected $_schema = array(
		'id' => array(
			'type' => 'integer',
			'key' => 'primary',
			'null' => true,
			'default' => false
		),
		'title' => array(
			'type' => 'string',
			'null' => true,
			'default' => ''
		),
		'date' => array(
			'type' => 'datetime',
			'null' => true,
			'default' => false
		),
		'body' => array(
			'type' => 'text',
			'null' => true,
			'default' => ''
		),
	);
}

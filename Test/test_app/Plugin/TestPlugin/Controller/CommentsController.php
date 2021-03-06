<?php
/**
 * CommentsController file.
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
 * Comments Controller
 *
 * It has all default CRUD methods, except delete. Used for testing purposes only.
 *
 * @package       Bancha.Test.test_app.Plugin.TestPlugin.Controller
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @since         Bancha v 2.1.0
 */
class CommentsController extends TestPluginAppController {

/**
 * This is an default CRUD method, which does nothing.
 * 
 * @return void nothing
 */
	public function index() {
	}

/**
 * This is an default CRUD method, which does nothing.
 *
 * @param string $id ignored
 * @return void nothing
 */
	public function view($id = null) {
	}

/**
 * This is an default CRUD method, which does nothing.
 * 
 * @return void nothing
 */
	public function add() {
	}

/**
 * This is an default CRUD method, which does nothing.
 * 
 * @param string $id ignored
 * @return void nothing
 */
	public function edit($id = null) {
	}
}

<?php
/**
 * Bancha test fixture
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * @package       Bancha.Test.Fixture
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @since         Bancha v 0.9.0
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 */

/**
 * Bancha test fixture
 *
 * @package       Bancha.Test.Fixture
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @since         Bancha v 0.9.0
 */
class TagFixture extends CakeTestFixture {

/**
 * fields property
 *
 * @var array
 * @access public
 */
	public $fields = array(
		'id' => array('type' => 'integer', 'null' => false, 'default' => null, 'key' => 'primary', 'collate' => null, 'comment' => ''),
		'string' => array('type' => 'string', 'null' => false, 'default' => null, 'length' => 64, 'collate' => null, 'comment' => ''),
		'indexes' => array('PRIMARY' => array('column' => 'id', 'unique' => 1)),
	);

/**
 * records property
 *
 * @var array
 * @access public
 */
	public $records = array(
		array('id' => 1, 'string' => 'CakePHP'),
		array('id' => 2, 'string' => 'Bancha'),
		array('id' => 3, 'string' => 'Sencha'),
	);
}

<?php
/**
 * AllSystemTest file.
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * @package       Bancha.Test.Case
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @since         Bancha v 0.9.0
 * @author        Florian Eckerstorfer <f.eckerstorfer@gmail.com>
 * @author        Andreas Kern <andreas.kern@gmail.com>
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @author        Kung Wong <kung.wong@gmail.com>
 */

/**
 * AllSystemTest class.
 *
 * This test group will run all test in the Bancha/Test/Case/System directory
 *
 * @package       Bancha.Test.Case
 * @since         Bancha v 0.9.0
 */
class AllSystemTest extends PHPUnit_Framework_TestSuite {

/**
 * Suite define the tests for this suite
 *
 * @return void
 */
	public static function suite() {
		$suite = new CakeTestSuite('System tests');

		$path = dirname(__FILE__) . DS . 'System';
		$suite->addTestFile($path . DS . 'BanchaRemotableFunctionTest.php');
		$suite->addTestFile($path . DS . 'BanchaBasicTest.php');
		$suite->addTestFile($path . DS . 'BanchaCrudTest.php');
		$suite->addTestFile($path . DS . 'TreeIntegrationTest.php');
		$suite->addTestFile($path . DS . 'BanchaDebugExceptionsTest.php');
		$suite->addTestFile($path . DS . 'BanchaExceptionsTest.php');
		$suite->addTestFile($path . DS . 'ConsistentModelTest.php');

		// $suite->addTestDirectory($path);
		return $suite;
	}
}

<?php
/**
 * AllTestsTest file.
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * @package       Bancha.Test.Case
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @since         Bancha v 2.2.0
 * @author        Florian Eckerstorfer <f.eckerstorfer@gmail.com>
 * @author        Andreas Kern <andreas.kern@gmail.com>
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @author        Kung Wong <kung.wong@gmail.com>
 */

App::uses('AllTestsTest', 'Bancha.Test/Case');

/**
 * AllFastTestsTest class
 *
 * This test group will run all fast tests in the Bancha/Test/Cases directory.
 *
 * @package       Bancha.Test.Case
 * @since         Bancha v 2.2.0
 */
class AllFastTestsTest extends AllTestsTest {

/**
 * Suite define the tests for this suite
 *
 * @return void
 */
	public static function suite() {
		Configure::write('fastTestsOnly', true);
		return AllTestsTest::suite();
	}
}

/*!
 *
 * Bancha : Seamlessly integrates CakePHP with Ext JS and Sencha Touch (http://bancha.io)
 * Copyright 2011-2014 codeQ e.U.
 *
 * Test the Mock.Proxy extension
 *
 * @copyright     Copyright 2011-2014 codeQ e.U.
 * @link          http://bancha.io Bancha
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha v 2.4.0
 *
 * For more information go to http://bancha.io
 */

describe('Mock.Proxy',function() {

    it('should be able to expect RCP calls',function() {
        var callback = function() {},
            scope = {},
            mock;

        // success
        mock = Mock.Proxy();
        mock.expectRPC('create',[{id:1,name:'juhu'},'secondDirectArgument']);
        mock.create([{id:1,name:'juhu'},'secondDirectArgument'],callback,scope);
        mock.verify();

        // error
        mock = Mock.Proxy();
        mock.expectRPC('create',[{id:1,name:'juhu'},'secondDirectArgument']);
        mock.create([{id:1,name:'juhu'},'secondDirectArgument'],'nocallback',scope);

        expect(function() {
            mock.verify();
        }).toThrow('mock function "create"\'s call 0. Argument[1]: Expected "nocallback"(string) to be a function.');
    });

    it('should be able to call the last rpc\'s callback', function() {
        var mock, callback, scope;

        // successfull without data
        mock = Mock.Proxy();
        callback = function() { this.success=true;};
        scope = { success:false};
        mock.expectRPC('create',[{id:1,name:'juhu'},'secondDirectArgument']);
        mock.create([{id:1,name:'juhu'},'secondDirectArgument'],callback,scope);
        mock.verify(); // just to keep clean

        // now test callLastRPCCallback
        mock.callLastRPCCallback('create');
        // verify
        expect(scope.success).toBeTruthy();



        // successfull with data
        mock = Mock.Proxy();
        callback = function(data) { this.success=data.successProperty;};
        scope = { success:false};
        mock.expectRPC('create',[{id:1,name:'juhu'},'secondDirectArgument']);
        mock.create([{id:1,name:'juhu'},'secondDirectArgument'],callback,scope);
        mock.verify(); // just to keep clean

        // now test callLastRPCCallback
        mock.callLastRPCCallback('create',[{
            successProperty: true
        }]);
        // verify
        expect(scope.success).toBeTruthy();
    });
});

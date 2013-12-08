[![Bancha logo](http://docs.banchaproject.org/wiki/images/github-logo.png)](http://banchaproject.com)

Bancha Basic composer plugin.
------------------------------

This is the composer build of Bancha Basic, only releases are pushed to this repository. For more information 
see http://bancha.io


Bancha Features
---------------

*   handles all communication between server and client
*   enables asynchronous and batched request to the server
*   is well-tested with PHPUnit and Jasmine

Compatibility
-------------
*   CakePHP 2.1.0 till latest
*   ExtJS 4.0.7 till latest
*   Sencha Touch 2.0.1.1 till latest

Installation
------------

To install with Composer please use the following instructions:

1. Add the package name with desired version (e.g. `"bancha/bancha-basic": "2.1.0"`) to the `require` key in your `composer.json`:

```
{
    "require": {
        "bancha/bancha-basic": "2.1.0"
    }
}

```
2. Run Composer's update command:

```
php composer.phar update
```

Composer will download and install the Bancha Basic to `Plugin/Bancha` app's folder.

For further instructions on using Bancha Basic please see [Installation and Usage](http://bancha.io/documentation-basic-installation.html).

Licensing
---------

Bancha comes in two flavors. We have an open source version of Bancha Basic and commercial version Bancha Pro. 
For complete details see the [Bancha Licensing Overview](http://bancha.io/licensing.html). To purchase a commercial 
license or premium support please visit the [Bancha Store](http://bancha.io/store.html).

To download either our free or commercial version go to the [Bancha website](http://bancha.io/download.html).

More information
----------------

*   [Bancha Overview](http://bancha.io/)
*   [Installation and Usage](http://bancha.io/documentation.html)
*   [Updates on Twitter](http://twitter.com/#!/banchaproject)


------------------------------
For any further questions just ask us: support@banchaproject.org

# VS Code Extension update checker

[![Build Status](https://travis-ci.org/HookyQR/VSCodeExtensionUpdateCheck.svg?branch=master)](https://travis-ci.org/HookyQR/VSCodeExtensionUpdateCheck)

Checks for any outdated extensions when you open a workspace. If it didn't find any, or it fails, the status message will close of automatically. If updates were found, the number of changed items is displayed. Hovering will show the version changes. Clicking will open the extension update dialog.

The update checker identifies an out of date extension by date first, then version number. Unfortuantely VS Code doesn't consider a new upload of the same version number as a change. If you are notified of an update where there is no version number change, you'll have to remove the extension and install it again to get the newer version.

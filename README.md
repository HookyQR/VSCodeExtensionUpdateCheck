# VS Code Extension update checker

[![Build Status](https://travis-ci.org/HookyQR/VSCodeExtensionUpdateCheck.svg?branch=master)](https://travis-ci.org/HookyQR/VSCodeExtensionUpdateCheck)

Checks for any outdated extensions when you open a workspace. If none are found the status message will close off automatically. If updates were found, the number of changed items is displayed. Hovering will show the version changes. Clicking will open the extension update dialog.

The update checker identifies an out of date extension by date first, then version number. Unfortuantely VS Code doesn't consider a new upload of the same version number a change. If you are notified of an update where there is no version number change, you'll have to remove the extension and install it again to get the newer version.

## Changes:
### 0.0.1: 28 Feb 2016
* Add publisher to discriminator for 'same-ness' as extensions are not unique on name.
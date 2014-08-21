ns-upload
=========

A simple node file watcher to upload changed files to your NetSuite file cabinet. It does rely on a RESTlet that updates a file
using the ```nlapiCreateFile``` suitescript function.

###Install
```bash
npm install -g ns-upload
```

###Configure
Create a ```ns-upload.json``` file in the root of your project. That file will need the following:

```json
{
    "url": "",
    "nsRootPath": "",
    "watched": "",
    "auth": {
        "email": "",
        "pass": "",
        "account": "",
        "role": ""
    }
}
```

####url
URL to a updateFile RESTlet in your NS instance. Someday, maybe we'll use SOAP, but for now this.
####nsRootPath
Path to the directory within the file cabinet that your project lives.
####watched
File patterns to be matched.
####auth
An object containing your Netsuite authentication credentials (email, pass, account, role).

###Run
Just run the command ```ns-upload``` while deving to watch your files.

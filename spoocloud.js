var environment = "browser";

if (typeof module !== 'undefined' && module.exports) {
    environment = "node";
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localStorage');
    sessionStorage = require("sessionstorage");
}


var URL = "https://spoo.io/api";
var APPID;
var RESSOURCE = {
    APPID: '/app',
    SHARED: '/shared/to/public',
    APPROVAL: '/shared/to/approval',
    CLOUDGUITEMPLATES: '/cloudguitemplates',
    REQUESTPASSWORDRESET: '/requestpasswordreset',
    RESETPASSWORD: '/resetpassword',
    CHANGEPASSWORD: '/password',
    APPLICATIONS: '/applications',
    RESTRICTED: '/restricted',
    CLIENTID: '/client',
    CLIENT: '/client',
    PUSH: '/push',
    PUBLISH: "/publish/to/shared",
    PULL: "/install/from/shared",
    REQUESTKEY: '/requestkey',
    AUTHENTICATED: '/authenticated',
    AUTH: '/auth',
    TOKEN: '/token',
    TOKEN_REJECT: '/token/reject',
    OBJECT: '/object',
    USER: '/user',
    TEMPLATE: '/template',
    PROPERTY: '/property',
    CALL: '/call',
    PERMISSION: '/permission',
    PRIVILEGE: '/privilege',
    CONDITIONS: '/conditions',
    NAME: '/name',
    USERNAME: '/username',
    EMAIL: '/email',
    TYPE: '/type',
    INHERIT: '/inherit',
    APPLICATION: '/application',
    EVENTLOG: '/eventlog',
    OBJECTS: '/objects',
    FRONTEND: '/frontend',
    TEMPLATES: '/templates',
    REGISTER: '/register',
    USERS: '/users',
    EVENTLOGS: '/eventlogs',
    FILE: '/file',
    DATA: '/data',
    FILES: '/files',
    COUNT: '/count',
    CHECKSYNTAX: '/checksyntax',
    AGGREGATE: '/aggregate',
    ONCREATE: '/onCreate',
    ONCHANGE: '/onChange',
    ONDELETE: '/onDelete',
    DATE: '/date',
    INTERVAL: '/interval',
    ACTION: '/action',
    VISIBILITY: '/visibility'
}

var failCounter = 0;

var BASE_URL = URL;
var REFRESH_URL = URL;

function getAccessToken() {
    return sessionStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function ajax(method, url, data, success, failure, token, multipart) {
    var xhr;
    console.debug(data);



    function refresh(method, url, data, success, failure, token, multipart) {
        if (failCounter > 5) return;

        console.log("refreshing...");
        console.log(arguments);

        failCounter++;

        var refreshUrl = REFRESH_URL + RESSOURCE.CLIENTID + '/' + localStorage.getItem('clientId'); //url.substr(0, url.lastIndexOf('/'));

        ajax('POST', refreshUrl + RESSOURCE.TOKEN, { refreshToken: getRefreshToken() }, function(_data) {
            if (typeof _data === 'string') _data = JSON.parse(_data);
            if (_data.token.accessToken) sessionStorage.setItem('accessToken', _data.token.accessToken);
            if (_data.token.refreshToken) localStorage.setItem('refreshToken', _data.token.refreshToken);


            console.log(_data);
            ajax(method, url, data, function(data_) {
                success(data_, false);
            }, function(err_) {

                failure(err_, true);
            }, getAccessToken());


        }, function(err) {

            return;
        });
    }

    if (XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }



    if (method == 'GET' && url.indexOf('?') == -1) url = url + '?' + data;
    xhr.open(method, url, true);

    if (!multipart) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
    } else {
        alert();
        console.debug(data.get('photos'));

    }

    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = function() {

        if (xhr.readyState == 4) {
            console.log(xhr.status);
            var br = false;

            if (xhr.status >= 200 && xhr.status <= 299) {
                failCounter = 0;

                success(JSON.parse(xhr.response || xhr.responseText), false);
            } else if (xhr.status == 401 && url.indexOf(RESSOURCE.TOKEN) != -1) {

            } else if (xhr.status == 401 && url.indexOf(RESSOURCE.AUTH) != -1) {

                if (localStorage.getItem('refreshToken')) {

                    refresh(method, url, data, success, failure, token, multipart)

                } else {
                    br = true;
                    try { failure({ error: "Login failed" }, true); } catch (e) {}
                    return;
                    //return;
                }

            } else if (xhr.status == 401) {

                if (br) return;
                if (localStorage.getItem('refreshToken')) {

                    refresh(method, url, data, success, failure, token, multipart)

                } else {
                    /*
                    try { window.location.reload(); } catch (e) {
                        console.error("No refresh token found");
                    }
                    try { failure(JSON.parse(xhr.response || xhr.responseText), true); } catch (e) { failure({ error: xhr.response || xhr.responseText }, true); }*/
                }
            } else {

                try { failure(JSON.parse(xhr.response || xhr.responseText), true); } catch (e) { failure({ error: xhr.response || xhr.responseText }, true); }
            }
        }
    }
    if (typeof data === 'object') data = JSON.stringify(data);
    xhr.send(data);
    return xhr;
}

function objToQueryString(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {

            if (typeof obj[i] == 'object') obj[i] = JSON.stringify(obj[i]);
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}

function SpooGlobal(_url, data) {

    if (!_url) this._url = URL;
    else this._url = _url;

    this.data = {};

    if (data) this.data = data;

    this.Applications = function(payload) {
        this._url = this._url + RESSOURCE.APPLICATIONS;
        if (typeof payload === 'object') this.data = payload;
        return new SpooGlobal(this._url, this.data);
    }

    this.Restricted = function() {

        _url = _url + RESSOURCE.RESTRICTED;

        return new Client(undefined, _url, undefined, this.data);
    }

    this.ajax = function(method, url, data, success, failure, token, multipart) {
        var xhr;
        console.debug(data);

        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (method == 'GET' && url.indexOf('?') == -1) url = url + '?' + data;
        xhr.open(method, url, true);
        if (!multipart) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
        } else {
            alert();
            console.debug(data.get('photos'));

        }

        if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {

                // alert(url);
                // alert(RESSOURCE.AUTHENTICATED);

                if (xhr.status >= 200 && xhr.status <= 299) {
                    failCounter = 0;
                    success(JSON.parse(xhr.response || xhr.responseText), false);

                } else {

                    try { failure(JSON.parse(xhr.response || xhr.responseText), true); } catch (e) { failure({ error: xhr.response || xhr.responseText }, true); }
                }
            }
        }
        if (typeof data === 'object') data = JSON.stringify(data);
        xhr.send(data);
        return xhr;
    }

    this.get = function(callback) {
        this.ajax('GET', this._url, objToQueryString(this.data), callback, callback, getAccessToken());
    }
}



function Client(_clientId, _url, _appId, data, modify) {

    if (_url === undefined) {
        _url = URL;
    }


    this.data = {};
    if (data) this.data = data;

    if (!modify) this.modifyInscructions = [];
    else this.modifyInscructions = modify;

    if (_clientId !== undefined && _url == URL) _url = URL + RESSOURCE.CLIENTID + '/' + _clientId;
    if (_appId !== undefined && _url == URL) _url = URL + RESSOURCE.APPID + '/' + _appId;

    this.url = _url;
    this.appId = _appId
    this.clientId = _clientId;

    console.log(_url);

    if (this.appId && this.clientId) BASE_URL = URL + RESSOURCE.CLIENTID + '/' + _clientId + RESSOURCE.APPID + '/' + _appId;

    this.auth = function(_username, _password, done, permanent) {
        if (!permanent) permanent = false;
        _url = _url + RESSOURCE.AUTH;
        this.data = { username: _username, password: _password };

        ajax('POST', _url, this.data, function(data) {

            if (typeof data === 'string') data = JSON.parse(data);

            if (permanent == true) {
                if (data.token.refreshToken) localStorage.setItem('refreshToken', data.token.refreshToken)
            }

            if (data.token.accessToken) sessionStorage.setItem('accessToken', data.token.accessToken);



            done(data, false);
        }, function(err) {

            done(err, true)
        });
    }

    this.authenticated = function(done) {
        _url = _url + RESSOURCE.AUTHENTICATED;

        ajax('GET', _url, {}, function(data) {

            done(true);
        }, done(false), getAccessToken());
    }


    this.logout = function(done) {
        _url = _url + RESSOURCE.TOKEN_REJECT;

        ajax('POST', _url, { accessToken: getAccessToken() }, function(data) {
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('clientId');
            localStorage.removeItem('appId');

            console.debug(data);
            done(data, false);
        }, done(data, true), getAccessToken());
    }

    this.io = function() {
        console.log("ioai: " + this.appId);
        console.log("iocl: " + this.clientId);
        localStorage.setItem('clientId', this.clientId);
        if (this.appId) localStorage.setItem('appId', this.appId);

        if (this.appId !== undefined) return new Client(this.clientId, undefined).AppId(this.appId);
        else return new Client(this.clientId, undefined);
    }

    this.AppId = function(id) {
        if (id) _url = _url + RESSOURCE.APPID + '/' + id;
        return new Client(this.clientId, _url, id);
    }

    this.Object = function(payload, query) {
        _url = _url + RESSOURCE.OBJECT;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Objects = function(payload, query) {
        _url = _url + RESSOURCE.OBJECTS;
        if (typeof payload === 'object') this.data = payload;
        else if (typeof payload === 'array') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Frontend = function(payload, query) {
        _url = _url + RESSOURCE.FRONTEND;
        if (typeof payload === 'object') this.data = payload;
        else if (typeof payload === 'array') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.User = function(payload, query) {
        _url = _url + RESSOURCE.USER;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Register = function() {
        _url = _url + RESSOURCE.REGISTER;

        return new Client(undefined, _url, undefined, this.data);
    }

    this.Users = function(payload, query) {
        _url = _url + RESSOURCE.USERS;
        if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Applications = function(payload) {
        _url = _url + RESSOURCE.APPLICATIONS;
        if (typeof payload === 'object') this.data = payload;
        return new Client(undefined, _url, undefined, payload);
    }

    this.Modify = function(payload) {
        this.data = payload;
        return new Client(undefined, _url, undefined, payload);
    }

    this.CloudGuiTemplates = function(payload) {
        _url = _url + RESSOURCE.CLOUDGUITEMPLATES;
        if (typeof payload === 'object') this.data = payload;
        return new Client(undefined, _url, undefined, payload);
    }

    this.Template = function(payload, query) {
        _url = _url + RESSOURCE.TEMPLATE;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Templates = function(payload, query) {

        _url = _url + RESSOURCE.TEMPLATES;
        if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Property = function(payload) {

        _url = _url + RESSOURCE.PROPERTY;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.addProperty = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "addProperty": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removeProperty = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removeProperty": [payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Push = function(payload) {

        _url = _url + RESSOURCE.PUSH;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Publish = function(payload) {

        _url = _url + RESSOURCE.PUBLISH;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Install = function(payload) {

        _url = _url + RESSOURCE.PULL;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.push = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "pushToArray": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Name = function(payload) {

        _url = _url + RESSOURCE.NAME;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { name: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setName = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setName": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Username = function(payload) {

        _url = _url + RESSOURCE.USERNAME;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { name: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setUsername = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setUsername": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Email = function(payload) {

        _url = _url + RESSOURCE.EMAIL;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { name: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.CheckSyntax = function(payload) {
        _url = _url + RESSOURCE.CHECKSYNTAX;
        return new Client(undefined, _url, undefined, payload);
    }

    this.setEmail = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setEmail": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Type = function(payload) {

        _url = _url + RESSOURCE.TYPE;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { name: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setType = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setType": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Inherit = function(payload) {

        _url = _url + RESSOURCE.INHERIT;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') {
            //payload = { value: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.addInherit = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "addInherit": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removeInherit = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removeInherit": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Application = function(payload) {

        _url = _url + RESSOURCE.APPLICATION;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') {
            //payload = { value: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setVisibility = function(payload) {

        _url = _url + RESSOURCE.VISIBILITY;
        if (payload !== undefined && typeof payload === 'boolean') {
            payload = { value: payload };
            this.data = payload;
        }

        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.addApplication = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "addApplication": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removeApplication = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removeApplication": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.AppData = function(payload) {
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Value = function(payload) {
        if (payload !== undefined && (typeof payload === 'string' || typeof payload === 'boolean' || !isNaN(payload))) {
            payload = { value: payload };
            this.data = payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyValue = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyValue": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setEventDate = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setEventDate": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setEventInterval = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setEventInterval": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setEventAction = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setEventAction": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Date = function(payload) {
        _url = _url + RESSOURCE.DATE;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { date: payload };
            this.data = payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyDate = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyDate": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Interval = function(payload) {
        _url = _url + RESSOURCE.INTERVAL;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { interval: payload };
            this.data = payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyInterval = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyInterval": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Action = function(payload) {
        _url = _url + RESSOURCE.ACTION;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { action: payload };
            this.data = payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyAction = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyAction": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.OnCreate = function(payload) {

        _url = _url + RESSOURCE.ONCREATE;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { value: payload };
            this.data = payload;
        }

        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyOnCreate = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyOnCreate": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setPropertyMeta = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyMeta": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setOnCreate = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setOnCreate": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.OnChange = function(payload) {

        _url = _url + RESSOURCE.ONCHANGE;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { value: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyOnChange = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyOnChange": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setOnChange = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setOnChange": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.OnDelete = function(payload) {

        _url = _url + RESSOURCE.ONDELETE;
        if (payload !== undefined && typeof payload === 'string') {
            payload = { value: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyOnDelete = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyOnDelete": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setOnDelete = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setOnDelete": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Permission = function(payload) {
        _url = _url + RESSOURCE.PERMISSION;
        if (payload !== undefined && typeof payload === 'string') {
            _url = _url + '/' + payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }


    this.setPropertyPermission = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyPermission": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removePropertyPermission = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removePropertyPermission": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removePropertyMeta = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removePropertyMeta": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.setPermission = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPermission": payload });
        return new Client(undefined, _url, undefined, this.data);
    }


    this.Privilege = function(payload) {
        _url = _url + RESSOURCE.PRIVILEGE;
        if (payload !== undefined && typeof payload === 'string') {
            _url = _url + '/' + payload;
        }
        if (typeof payload === 'object') this.data = payload;
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPermission = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPermission": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removePermission = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removePermission": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.addPrivilege = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "addPrivilege": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.removePrivilege = function(payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "removePrivilege": payload });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.Conditions = function(payload) {
        _url = _url + RESSOURCE.CONDITIONS;
        if (payload === undefined) {
            _url = _url + '/' + payload;
        }
        if (typeof payload === 'string') {
            this.data = { 'conditions': payload };
            payload = { 'conditions': payload };
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.setPropertyConditions = function(propName, payload) {
        console.debug(this.data);
        if (!Array.isArray(this.data)) this.data = [];
        this.data.push({ "setPropertyConditions": [propName, payload] });
        return new Client(undefined, _url, undefined, this.data);
    }

    this.EventLog = function(payload, query) {
        _url = _url + RESSOURCE.EVENTLOG;
        if (payload !== undefined && typeof payload === 'string') _url = _url + '/' + payload;
        else if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.EventLogs = function(payload, query) {
        _url = _url + RESSOURCE.EVENTLOGS;
        if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.Files = function(payload, query) {
        _url = _url + RESSOURCE.FILES;
        if (typeof payload === 'object') this.data = payload;
        if (query) _url = _url + '?' + objToQueryString(query);
        return new Client(undefined, _url, undefined, payload);
    }

    this.File = function(payload, query) {
        _url = _url + RESSOURCE.FILE;
        if (payload !== undefined && typeof payload === 'string') {
            _url = _url + '/' + payload;
        } else if (typeof payload === 'object') {
            this.data = payload;
        }

        return new Client(undefined, _url, undefined, payload);

    }

    this.Data = function(payload) {
        _url = _url + RESSOURCE.DATA;
        if (payload !== undefined && typeof payload === 'string') {
            _url = _url + '/' + payload;
        } else if (typeof payload === 'object') {
            console.debug(data);
            this.data = payload;
        }

        _url = _url + "?token=" + getAccessToken();


        return new Client(undefined, _url, undefined, payload);


    }

    this.NewClient = function(payload) {
        _url = _url + RESSOURCE.CLIENT;

        if (payload !== undefined && typeof payload === 'object') {
            payload = payload;
            this.data = payload;
        }
        return new Client(undefined, _url, undefined, payload);
    }

    this.RequestKey = function(payload) {

        _url = _url + RESSOURCE.REQUESTKEY;

        if (payload !== undefined && typeof payload === 'string') {
            payload = { email: payload };
            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.RequestPasswordReset = function(payload) {
        _url = _url + RESSOURCE.REQUESTPASSWORDRESET;

        if (payload !== undefined && typeof payload === 'object') {

            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }


    this.ResetPassword = function(payload) {
        _url = _url + RESSOURCE.RESETPASSWORD;

        if (payload !== undefined && typeof payload === 'object') {

            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.ChangePassword = function(payload) {
        _url = _url + RESSOURCE.CHANGEPASSWORD;

        if (payload !== undefined && typeof payload === 'object') {

            this.data = payload;
        }
        console.debug(this.data);
        return new Client(undefined, _url, undefined, payload);
    }

    this.path = function() {
        this.url += RESSOURCE.DATA;
        return this.url + "?token=" + getAccessToken();
    }

    this.shared = function(payload) {

        _url = _url + RESSOURCE.SHARED;

        return new Client(undefined, _url, undefined, this.data);
    }

    this.approval = function(payload) {

        _url = _url + RESSOURCE.APPROVAL;

        return new Client(undefined, _url, undefined, this.data);
    }

    this.Public = function(payload) {

        _url = URL;
        if (this.appId) _url = _url + RESSOURCE.APPID + '/' + this.appId;

        return new Client(undefined, _url, undefined, this.data);
    }



    this.add = function(callback) {
        ajax('POST', this.url, this.data, callback, callback, getAccessToken());
    }

    this.upload = function(callback) {
        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }


        if (this.url.indexOf('/data') != -1) xhr.open('PUT', this.url, true);
        else xhr.open('POST', this.url, true);

        xhr.setRequestHeader('Authorization', 'Bearer ' + getAccessToken());

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {

                if (xhr.status >= 200 && xhr.status <= 299) {
                    callback(JSON.parse(xhr.response || xhr.responseText), false);
                } else callback(false, true);
            }
        }
        xhr.send(this.data);
    }

    this.count = function(callback) {
        this.url += RESSOURCE.AGGREGATE + RESSOURCE.COUNT;
        ajax('GET', this.url, objToQueryString(this.data), callback, callback, getAccessToken());
    }

    this.call = function(callback, data) {
        if (data) this.data = data;
        else this.data = {};

        this.url += RESSOURCE.CALL;
        ajax('POST', this.url, this.data, callback, callback, getAccessToken());
    }

    this.delete = function(callback) {
        this.data = {};
        ajax('DELETE', this.url, this.data, callback, callback, getAccessToken());
    }

    this.save = function(callback) {
        ajax('PUT', this.url, this.data, callback, callback, getAccessToken());
    }

    this.get = function(callback) {
        console.log("ss: " + sessionStorage.getItem("accessToken"));
        ajax('GET', this.url, objToQueryString(this.data), callback, callback, getAccessToken());
    }

    return this;
}

var SPOO_Client = Client;
var SPOO = Client;

if (environment == "node") {
    module.exports = SPOO;
}
(function (exports) {
    var obj = {};
    exports.$PAndGHTML = obj;

    ///给url发送请求并获得内容
    ///url       : 请求路径
    ///path      : 查询的XPath路径
    ///timerCount:定义的计时时间
    ///返回      ： 节点集合
    obj.getAndFindFunction = function (url, path, timerCount) {
        var nodes = null;//返回的结果集
        //发送请求
        sendRequestFunction(url, timerCount, function (data) {
            var domParser = new DOMParser();
            var xmlDocumentObj = domParser.parseFromString(data, 'text/html'); //将字符串转成XML Document 对象
            nodes = getSpecialContent(xmlDocumentObj, path);            //查找节点并返回节点集
        }, function (errorText) {
            if (errorText == "createError") {
                alert('抱歉，无法创建');
            } else if (errorText == "error") {
                alert('抱歉，请求错误');
            } else if (errorText === 404) {
                alert("路径请求错误");
            }
        });
        return nodes;
    }


    ///根据url发送请求，获得内容，处理了超时、路径错误、error的情况
    ///url             : 请求路径
    ///timerCount      :定义的计时时间
    ///callbackFunction:成功之后的回调函数
    ///errorFunction   :发生错误时的处理函数 createError：无法创建，error：请求错误，其他非正常编码
    function sendRequestFunction(url, timerCount, callbackFunction, errorFunction) {
        //设置跨域访问请求对象
        var xmlHttp = new XMLHttpRequest();
        if ("withCredentials" in xmlHttp) { // "withCredentials"属性是XMLHTTPRequest2中独有的
            xmlHttp.open('GET', url, false);
        } else if (typeof XDomainRequest != "undefined") { // 检测是否XDomainRequest可用
            xmlHttp = new XDomainRequest();
            xmlHttp.open('GET', url);
        } else {
            errorFunction('createError');
            return;
        }

        //根据设置的时间，设置计时器，防止超时
        var timedout = false;
        var timer = setTimeout(function () {
            timedout = true;
            xmlHttp.abort();
        }, timerCount);

        //状态改变时
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState != 4) { return; }
            if (timedout) { return; }
            clearTimeout(timer);
            if (xmlHttp.status === 200) {
                callbackFunction(xmlHttp.responseText);
            } else {
                errorFunction(xmlHttp.status);
            }
        };
        //出错时
        xmlHttp.onerror = function () {
            errorFunction('error');
        };

        try{
            xmlHttp.send(null);
        } catch (e) {
            if (e.code == 19)
                errorFunction('error');
        }
    }

    ///获得XMLDocumentObj的特定内容
    ///XMLDocumentObj: xmlDocument对象
    ///path          : 查询的XPath路径
    ///返回          ： 节点集合
    function getSpecialContent(XMLDocumentObj, path) {
        var nodeList = null;

        if (window.ActiveXObject) {
            // code for IE
            XMLDocumentObj.setProperty("SelectionLanguage", "XPath");
            nodeList = XMLDocumentObj.selectNodes(path);
        } else if (document.implementation && document.implementation.createDocument) {
            // code for Mozilla, Firefox, Opera, etc.
            var nodes = XMLDocumentObj.evaluate(path, XMLDocumentObj, null, XPathResult.ANY_TYPE, null);
            var result = nodes.iterateNext();
            nodeList = [];
            while (result) {
                nodeList.push(result);
                result = nodes.iterateNext();
            }
        }

        return nodeList;
    }
})(this);
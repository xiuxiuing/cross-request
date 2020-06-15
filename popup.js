function generateHtml(url) {
  return `
        <div class="item">
          <span class="url">${url}</span> 
          <span class="del">✕</span>
        </div>
      `
}


var key = 'y_request_allow_urls';

var urls = chrome.runtime.sendMessage({action:'get', name: key}, function(urls){
  var urlDom = $('#urls');
  try{
    urls = JSON.parse(urls);
  }catch(e){
    urls = null;
  }

  if(!urls ||  Object.keys(urls).length === 0){
    urls = { '*': true};
    chrome.runtime.sendMessage({action:'set', name: key, value: JSON.stringify(urls)})
  }

  for (var url in urls) {
    urlDom.append(generateHtml(url));
  }

  $('#add .submit').bind('click', function () {
    var val = $('#add input').val()
    if (val) urls[val] = true;
    chrome.runtime.sendMessage({
      action:'set',
      name: key,
      value: JSON.stringify(urls)
    })

    urlDom.append(generateHtml(val))
  })

  $(document).ready(function () {
    console.log("clear");

    $('#content').hide();

    var bg = chrome.extension.getBackgroundPage();
    bg.getProxy(function (details) {
      console.log(details);
      if (details.hasOwnProperty('value')) {
        var value = details.value;
        var mode = value.mode;
        var singleProxy = null;

        if (value.hasOwnProperty('rules')){
          var rules = value.rules;
          if (rules.hasOwnProperty('singleProxy')) {
            singleProxy = rules.singleProxy;
          }
        }

        if (singleProxy != null){
          $('#text').text("当前代理：" + singleProxy.host + ":" + singleProxy.port);
        }
      }

    });
  });

  $("#clear").bind('click', function () {
    console.log("clear");
    var bg = chrome.extension.getBackgroundPage();
    bg.clearProxy(); //是background中的一个方法
  });

  $("#get").bind('click', function () {
    console.log("get");
    var bg = chrome.extension.getBackgroundPage();
    //是background中的一个方法
    $('#content').show();

    bg.getProxy(function (details) {
      $('#content').text(JSON.stringify(details, null, '\t' ));
    });
  });

  urlDom.on('click', '.del', function (event) {
    var p = event.target.parentNode;
    var url = $(p).find('.url').text();
    delete urls[url]

    chrome.runtime.sendMessage({
      action:'set',
      name: key,
      value: JSON.stringify(urls)
    })
    p.parentNode.removeChild(p)
  })
});

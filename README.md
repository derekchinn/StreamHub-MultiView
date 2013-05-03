# StreamHub-Multiview
StreamHub-MultiView is a view that allows you to display multiple StreamHub Views in one element and control which view is displayed by a user defined control group (i.e. navigation tabs, buttons, etc.). In addition to allowing for easy view switching, MultiView also contains some performance optimizations that'll help keep the page running fast with multiple views. 

## Usage

#### HTML Control Elements
To control the switching of views, you'll need to define a number of HTML elements that you can reference back to later (either by id, class, or tags). For each item that will be "click-able", you'll have to add an attribute of 'data-articleId' that will contain the article's unique ID.

Example:
  
    <nav>
        <a data-articleId="article_id_1" class="tab1 navigation-tab">article_id_1</a>
        <a data-articleId="article_id_2" class="tab2 navigation-tab">article_id_2</a>
        <a data-articleId="article_id_3" class="tab3 navigation-tab">article_id_3</a>
        <a data-articleId="article_id_4" class="tab4 navigation-tab">article_id_4</a>
    </nav>

With the above example, I could later access the control elements by doing either `document.getElementsByTagName("nav")[0].children()` or `document.getElementsByClassName("navigation-tab")`.
  
#### Javascript
Once we get the control elements in place, we need to actually generate the views for the MultiView to display. The Example below is done in pseudo code, but hopes to illustrate the following:  

1.  Setting up View objects
2.  Setting up the binding options for the associated views
3.  Building a pairing of the views and binding options
4.  Instantiating the MultiView object with the desired configs.
 
Example:
  
    <!--View and Binding Options setup-->
    
    var view1 = new IsotopView({view settings1});
    var view2 = new IsotopView({view settings2});
    var bindOpts1 = {binding settings1}
    var bindOpts2 = {binding settings2}
    
    <!-- 
    Setting up the configs
    - "load": boolean that tells the MultiView which view to load on init
    -->
    
    var config1 = {
      bindOpts: bindOpts1,
      view: view1,
      load: true
    }
    var config2 = {
      bindOpts: bindOpts2,
      view: view2,
      load: false
    };
    
    <!-- Final configs to be passed -->
     
    var viewConfigs = [
      config1,
      config2
    ];
    
    <!--
    Final invocation
    - el: is the object that the view will populate
    - loggingOn: turns console logging on (boolean, default is false)
    - nav: an array of DOM elements that control which view is displayed
    -->
    new MultiView({
      el: document.getElementById("target-element"),
      loggingOn: true,
      nav: document.getElementsByClassName("navigation-tabs"),
      viewConfigs: viewConfigs
    });

# Getting Started

Install npm

Use npm to install this package

    npm install

[Bower](http://twitter.github.com/bower/) is used for dependency management. The npm postinstall script will run `bower install` and put dependencies in `lib/`.

StreamHub-MultiView is written as an [AMD](http://requirejs.org/docs/whyamd.html) module. You will need to use an AMD loader like [RequireJS](http://requirejs.org/) to use it. Add it as a package in your RequireJS config:

    packages: [{
        name: 'streamhub-multiview',
        location: './path/to/StreamHub-MultiView'
    }]

Then you can use it like:

    require(['streamhub-multiview'], function (MultiView) {
        // Your code here
    })

# Documentation
You can access the API Reference [on GitHub](http://derekchinn.github.com/StreamHub-MultiView/docs)

The API reference also lives in the `docs/` directory. You can view them in your browser with:

    open docs/index.html

You can re-build the documentation using:

    npm run-script doc

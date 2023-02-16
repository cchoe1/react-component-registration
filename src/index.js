import React from "react";
import ReactDOM from "react-dom";

class Registrar {
  constructor() {
    this.components = {};
    this.instances = {};
  }

  component(tag='', component=null, props={}) {
    this.components[tag] = {
      tag,
      component,
      props,
    }

  }

  // One possible way is to just initialize at the start
  init() {
    for (var key in this.components) {
      let selected = document.querySelectorAll(key);
      for (var i=0; i<selected.length; i++) {
        this._render(key, selected[i]);
      }
    }
  }

  // Another way to run by observing for mutations
  observe(selector) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    const observer = new MutationObserver(this.init.bind(this))

    observer.observe(targetNode, config);
  }

  _render(tag, container) {
    let initialized = container.getAttribute('initialized');
    if (initialized) {
      return;
    }

    let children = container.childNodes;
    let childComponents = [];
    for (var i=0; i<children.length; i++) {
      let child = children[i];
      let childTag = child.tagName;
      let childTagLower = childTag ? childTag.toLowerCase() : null
      if (childTagLower && childTagLower in this.components) {
        let childProps = {};
        for (var key in this.components[childTagLower].props) {
          childProps[key] = child.getAttribute(this.components[childTagLower].props[key]);
        }
        childComponents.push(React.createElement(this.components[childTagLower].component, childProps));
      }
    }

    let props = {};
    for (var key in this.components[tag].props) {
      props[key] = container.getAttribute(this.components[tag].props[key]);
    }
    // Create the container with all the children
    let element = React.createElement(this.components[tag].component, props, ...childComponents);

    const root = ReactDOM.createRoot(container);
    root.render(element);

    container.setAttribute('initialized', true);
  }
}

export default Registrar;

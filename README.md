# What is this?
This module intends to implement a similar feature found in [Vue.js](https://vuejs.org/guide/components/registration.html) that allows you to map components to custom HTML tags.  This functionality is useful on partially decoupled websites where a central entrypoint is not used to load in all components.  If your website is generated mostly server-side but you want to integrate React components into parts of your website, this tool can help with rendering components with little hassle.  Instead of repeatedly calling ReactDOM.render(), you can simply register your components and use them in your HTML and they will be instantiated automatically.

You can also map HTML attributes to props on your component by defining the mappings and passing the props on-the-fly.  This means server responses which include HTML can pass data directly to a component on load, agnostic to your back-end language.


Please note that output is HTML and that all rules with HTML applies.  No spaces, all lowercase, etc.

This library utilizes the MutationObserver API to detect when new components are added to the DOM and will automatically instantiate them. 

# Installation

# Usage

Assuming you have a basic component as such:

    // MyComponent.js
    export const MyComponent = ({ text }) => {
        return (
            <div>
                <p>{text}</p>
            </div>
        );
    }

First instantiate an instance in an index.js or similar:

    // index.js
    import Registrar from 'react-component-registrar';

    const registrar = new Registrar();

You can then register your component using the instance of Registrar.  If you want to pass a prop directly to this top-level component, you can do so by passing a third argument which defines the *mapping* of your component props to HTML attributes

    // index.js
    import { MyComponent } from './MyComponent';

    registrar.component('custom-component', MyComponent, {
        text: 'data-text'
    });

Finally, you need to ensure you init the renderer.  You have 2 options:

    // Should wait for DOMContentLoaded to fire
    document.addEventListener('DOMContentLoaded', () => {
        // This will immediately render any and all registered components that exist on the page -- once.
        registrar.init();

        // This will place an observer on the DOM Node to watch for any changes/updates and will render any new components that are added.
        registrar.observe(document.getElementsByTagName('body')[0]);
    });

Then when you specify any html as such:

    <custom-component data-text="Hello World"></custom-component>

It would render MyComponent with the prop text set to "Hello World".  This allows you to do things like:

    <custom-component data-text="Hello World"></custom-component>
    <custom-component data-text="Hello World 2"></custom-component>
    <custom-component data-text="Hello World 3"></custom-component>

Which would render multiple instances of MyComponent whilst using different props.  There may be slight differences depending on whether you use `init()` or `observe()`.

## Real World Example

A real life example could be to register a component related to showing error messages.  This would allow server-generated errors to be displayed on the front end via a React component.

    // ErrorMessage.jsx
    export const ErrorMessage = ({ message }) => {
        const [isVisible, setIsVisible] = useState(true);
        useEffect(() => {
            // Display for 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        }, []);

        if (!isVisible) {
             return null;
        }

        return (
            <div className="error-message">
                <p>{message}</p>
            </div>
        );
    }

...and then register it:

    // index.js
    import Registrar from 'react-component-registrar';
    import { ErrorMessage } from './ErrorMessage';

    const registrar = new Registrar();

    registrar.component('error-message', ErrorMessage, {
        message: 'data-message'
    });

    document.addEventListener('DOMContentLoaded', () => {
        registrar.observe(document.getElementsByTagName('body')[0]);
    });
    

You can then utilize this custom HTML tag in a variety of ways:

*PHP + Twig:*

    // index.html.twig (using PHP + Twig)
    {% if errors is defined %}
        {% for error in errors %}
            <error-message data-message="{{ error }}"></error-message>
        {% endfor %}
    {% endif %}

*Drupal Render Arrays:*

    // As a response from a Drupal form build()
    if ($error) {
        $form['errors'] = [
            '#type' => 'html_tag',
            '#tag' => 'error-message',
            '#attributes' => [
                'data-message' => $error,
            ],
        ];
    }

*Plain HTML:*

    <div class="container">
    </div>

    <script>
        const container = document.querySelector('.container');
        const errorMessage = grabErrorMessage(); // pull error from somewhere
        if (errorMessage) {
            container.innerHTML = `<error-message data-message="${errorMessage}"></error-message>`;
        }
    </script>
    

# License

This software is distributed under the MIT License.  Please review the LICENSE file included in this package for more information.
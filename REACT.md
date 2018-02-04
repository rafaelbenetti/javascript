# React Js

* [Overview](#overview)
    * [Components](#components)
    * [Component Api](#component-api)
    * [Component Types](#component-types)
    * [Jsx](#jsx)
    * [Props](#props)
    * [State](#state)

## Overview
- A JavaScript library for building user interfaces.
- Declarative: React will efficiently update and render just the right components when your data changes.
- Component based: Build encapsulated components that manage their own state.

## Components
- The smallest part of your UI.
- They allow us to reuse or common parts of our application.
- Components are written using JSX, usually.
- Components possess a small set of lifecycle and utility methods.
- Components can also be written as pure functions.

## Component API
- React provide us an Api for work with components.
- Some examples (render, setState, componentWillMount)

## Component Types
- Functional Component: A functional component is a function that takes a props object as argument, and returns a bunch of HTML.
- By the way, one of these methods is setState, and this means functional components cannot have state. For that reason they’re often referred to as stateless functional components.
- Since functional components require much less boilerplate code, it makes sense to use them whenever possible. For this reason, most React apps contain a healthy mix of both syntaxes.

- Using classes:
```jsx
class MyComponent extends React.Component {
  render() {
    return <p>Hello World!<p>;
  }
}
```

- Using functional:
```jsx
const myComponent = props => {
  return <p>Hello {props.name}! Today is {new Date()}.</p>
}
```

## Jsx
- It is a syntax extension to JavaScript. 
- It keeps your components definitions on your Javascript files.

```jsx
const element = <h1>Hello, world!</h1>;
```

```jsx
const element = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
);
```

## Props
- Props are how components talk to each other.  
- Props are unidirectional: data can only go from parent components to their children.
- In practice, the vast majority of data in a React app will be a prop.
- It’s only when you need to accept user input that you’ll use state to handle the change.

```jsx
class ParentComponent extends React.Component {
  render() {
    return <ChildComponent message="Hello World"/>;
  }
}
class ChildComponent extends React.Component {
  render() {
    return <p>And then I said, '{this.props.message}'</p>;
  } 
}
```

## State
- It's used to keep state between components.

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```

- [Common Questions](https://github.com/Pau1fitz/react-interview)

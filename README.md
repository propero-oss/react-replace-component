# react-replace-component
Replace react components dynamically at a later time

    npm i @propero/react-replace-component

## Getting started

```typescript jsx
import { createComponentStore } from "@propero/react-replace-component";

const { useComponent, useComponents, registerComponent, setNamespace } = createComponentStore();

export function Target() {
  return <div className="a" />;
}


export function AnotherComponent() {
  return <div className="aa" />;
}

export function Replacement() {
  return <div className="b" />;
}

export function MyPage() {
  // This allows the component to be replaced at a later time
  const TargetEx = useComponent(Target);
  return <TargetEx />;
}

export function MultipleComponents() {
  // Allows for replacing multiple components, each one can be replaced individually still.
  // Components are suffixed with Ex to avoid shadowing or having to rename properties in destructuring.
  const { TargetEx, AnotherComponentEx } = useComponents({ Target, AnotherComponent });
  return <>
    <TargetEx />
    <AnotherComponentEx />
  </>;
}

// This replaces the Target components with Replacement components.
// Only works if current namespace is default
registerComponent(Target, Replacement);

// Switch themes/extensions/customer specific replacements quickly with namespaces
setNamespace("foo")
```

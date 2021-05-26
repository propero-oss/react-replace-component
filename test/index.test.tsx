import React, { ReactElement } from "react";
import { ComponentStore, createComponentStore } from "src/index";
import renderer, { act, ReactTestRenderer, TestRendererOptions } from "react-test-renderer";

function A(): JSX.Element {
  return <div className="a" />;
}

function B(): JSX.Element {
  return <div className="b" />;
}

function C(): JSX.Element {
  return <div className="c" />;
}

function Playground({ store }: { store: ComponentStore }): JSX.Element {
  const { useComponent, useComponents } = store;
  const AEx = useComponent(A);
  const { BEx, CEx } = useComponents({ B, C });
  return (
    <>
      <AEx />
      <BEx />
      <CEx />
    </>
  );
}

function create(nextElement: ReactElement, options?: TestRendererOptions): ReactTestRenderer {
  let component: ReactTestRenderer;
  act(() => {
    component = renderer.create(nextElement, options);
  });
  return component!;
}

describe("index.ts", () => {
  let store: ComponentStore;
  beforeEach(() => (store = createComponentStore()));

  it("should pass through components that are not replaced", () => {
    const rendered = create(<Playground store={store} />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should pass through components not registered in current namespace", () => {
    const rendered = create(<Playground store={store} />);
    store.registerReplacement(A, B, "foo");
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should replace components replaced in registered namespace", () => {
    const rendered = create(<Playground store={store} />);
    expect(rendered.toJSON()).toMatchSnapshot();
    act(() => store.registerReplacement(A, B));
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should restore components no longer replaced on namespace change", () => {
    const rendered = create(<Playground store={store} />);
    expect(rendered.toJSON()).toMatchSnapshot();
    act(() => store.registerReplacement(A, B));
    expect(rendered.toJSON()).toMatchSnapshot();
    act(() => store.setNamespace("bar"));
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should return the current namespace", () => {
    expect(store.getNamespace()).toEqual("default");
    store.setNamespace("foo");
    expect(store.getNamespace()).toEqual("foo");
  });

  it("should throw for multiple registrations of the same component in the same namespace", () => {
    store.registerReplacement(A, B);
    expect(() => store.registerReplacement(A, C)).toThrow();
  });
});

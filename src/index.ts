import { createStore, ReadOnlyStore } from "@propero/easy-store";
import { useEffect, useState } from "react";

type Replacement<T = unknown> = [T, T];

interface ComponentData {
  namespace: string;
  components: Record<string, Replacement[]>;
}

export type MappedComponents<T> = {
  [Key in keyof T as `${Key & string}Ex`]: T[Key];
};

export interface ComponentStore extends ReadOnlyStore<ComponentData> {
  registerReplacement<T>(component: T, replacement: T, ns?: string): void;
  getComponent<T>(component: T): T;
  useComponent<T>(component: T): T;
  useComponents<T>(components: T): MappedComponents<T>;
  setNamespace(namespace: string): void;
  getNamespace(): string;
}

export function createComponentStore(): ComponentStore {
  const { sub, unsub, update, getValue } = createStore<ComponentData>({
    namespace: "default",
    components: {},
  });

  function registerReplacement<T>(component: T, replacement: T, ns: string = "default"): void {
    update(({ components, namespace }) => {
      let replacements = (components[ns] ??= []);
      if (replacements.find(([original]) => original === component))
        throw new Error(`Cannot register one component multiple times in one namespace.`);
      replacements = [...replacements, [component, replacement]];
      components = { ...components, [ns]: replacements };
      return { components, namespace };
    });
  }

  function getComponent<T>(component: T, { components, namespace }: ComponentData = getValue()): T {
    return (
      (components[namespace]?.find(([original]) => original === component)?.[1] as T) ?? component
    );
  }

  function useComponent<T>(component: T): T {
    const [comp, setComp] = useState<T>(() => getComponent(component));

    useEffect(() => {
      function handler(newVal: ComponentData, oldVal: ComponentData): void {
        const newComp = getComponent(component, newVal);
        const oldComp = getComponent(component, oldVal);
        if (newComp !== oldComp) setComp(() => newComp);
      }
      sub(handler);
      return () => unsub(handler);
    }, [component]);

    return comp;
  }

  function useComponents<T>(components: T): MappedComponents<T> {
    return Object.fromEntries(
      Object.entries(components).map(([name, component]) => [`${name}Ex`, useComponent(component)])
    ) as any;
  }

  function setNamespace(namespace: string): void {
    update(({ components }) => ({ namespace, components }));
  }

  function getNamespace(): string {
    return getValue().namespace;
  }

  return {
    sub,
    unsub,
    getValue,
    registerReplacement,
    getComponent,
    useComponent,
    useComponents,
    setNamespace,
    getNamespace,
  };
}

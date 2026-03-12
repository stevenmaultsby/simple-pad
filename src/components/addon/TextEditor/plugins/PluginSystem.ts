export interface EditorPlugin {
  name: string;
  nodes?: any[];
  transformers?: any[];
  plugins?: React.ComponentType<any>[];
}

export interface PluginSystem {
  registerPlugin(plugin: EditorPlugin): void;
  getPlugins(): EditorPlugin[];
  getNodes(): any[];
  getTransformers(): any[];
  getPluginComponents(): React.ComponentType<any>[];
}

export class DefaultPluginSystem implements PluginSystem {
  private plugins: EditorPlugin[] = [];

  registerPlugin(plugin: EditorPlugin): void {
    this.plugins.push(plugin);
  }

  getPlugins(): EditorPlugin[] {
    return this.plugins;
  }

  getNodes(): any[] {
    return this.plugins.flatMap((plugin) => plugin.nodes || []);
  }

  getTransformers(): any[] {
    return this.plugins.flatMap((plugin) => plugin.transformers || []);
  }

  getPluginComponents(): React.ComponentType<any>[] {
    return this.plugins.flatMap((plugin) => plugin.plugins || []);
  }
}

export const defaultPluginSystem = new DefaultPluginSystem();

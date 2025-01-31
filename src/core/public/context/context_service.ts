/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { IContextContainer, ContextContainer } from './context';
import { CoreContext } from '../core_system';
import { PluginOpaqueId } from '../plugins';

interface StartDeps {
  pluginDependencies: ReadonlyMap<PluginOpaqueId, PluginOpaqueId[]>;
}

/** @internal */
export class ContextService {
  constructor(private readonly core: CoreContext) {}

  public setup({ pluginDependencies }: StartDeps): ContextSetup {
    return {
      createContextContainer: <
        TContext extends {},
        THandlerReturn,
        THandlerParameters extends any[] = []
      >() =>
        new ContextContainer<TContext, THandlerReturn, THandlerParameters>(
          pluginDependencies,
          this.core.coreId
        ),
    };
  }
}

/**
 * {@inheritdoc IContextContainer}
 *
 * @example
 * Say we're creating a plugin for rendering visualizations that allows new rendering methods to be registered. If we
 * want to offer context to these rendering methods, we can leverage the ContextService to manage these contexts.
 * ```ts
 * export interface VizRenderContext {
 *   core: {
 *     i18n: I18nStart;
 *     uiSettings: UISettingsClientContract;
 *   }
 *   [contextName: string]: unknown;
 * }
 *
 * export type VizRenderer = (context: VizRenderContext, domElement: HTMLElement) => () => void;
 *
 * class VizRenderingPlugin {
 *   private readonly vizRenderers = new Map<string, ((domElement: HTMLElement) => () => void)>();
 *
 *   setup(core) {
 *     this.contextContainer = core.createContextContainer<
 *       VizRenderContext,
 *       ReturnType<VizRenderer>,
 *       [HTMLElement]
 *     >();
 *
 *     return {
 *       registerContext: this.contextContainer.registerContext,
 *       registerVizRenderer: (plugin: PluginOpaqueId, renderMethod: string, renderer: VizTypeRenderer) =>
 *         this.vizRenderers.set(renderMethod, this.contextContainer.createHandler(plugin, renderer)),
 *     };
 *   }
 *
 *   start(core) {
 *     // Register the core context available to all renderers. Use the VizRendererContext's pluginId as the first arg.
 *     this.contextContainer.registerContext('viz_rendering', 'core', () => ({
 *       i18n: core.i18n,
 *       uiSettings: core.uiSettings
 *     }));
 *
 *     return {
 *       registerContext: this.contextContainer.registerContext,
 *
 *       renderVizualization: (renderMethod: string, domElement: HTMLElement) => {
 *         if (!this.vizRenderer.has(renderMethod)) {
 *           throw new Error(`Render method '${renderMethod}' has not been registered`);
 *         }
 *
 *         // The handler can now be called directly with only an `HTMLElement` and will automatically
 *         // have a new `context` object created and populated by the context container.
 *         const handler = this.vizRenderers.get(renderMethod)
 *         return handler(domElement);
 *       }
 *     };
 *   }
 * }
 * ```
 *
 * @public
 */
export interface ContextSetup {
  /**
   * Creates a new {@link IContextContainer} for a service owner.
   */
  createContextContainer<
    TContext extends {},
    THandlerReturn,
    THandlerParmaters extends any[] = []
  >(): IContextContainer<TContext, THandlerReturn, THandlerParmaters>;
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import { SourceConfigurationFlyoutState } from '../../components/source_configuration';
import { MetricsTimeContainer } from '../../containers/metrics/with_metrics_time';
import { Source } from '../../containers/source';

export const withMetricPageProviders = <T extends object>(Component: React.ComponentType<T>) => (
  props: T
) => (
  <Source.Provider sourceId="default">
    <SourceConfigurationFlyoutState.Provider>
      <MetricsTimeContainer.Provider>
        <Component {...props} />
      </MetricsTimeContainer.Provider>
    </SourceConfigurationFlyoutState.Provider>
  </Source.Provider>
);

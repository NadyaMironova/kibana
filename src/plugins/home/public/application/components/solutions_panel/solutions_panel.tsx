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

import React, { Fragment, FC } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiHorizontalRule,
} from '@elastic/eui';
import { SolutionTitle } from './solution_title';
import { FeatureCatalogueEntry } from '../../../';
import { createAppNavigationHandler } from '../app_navigation_handler';
import { FeatureCatalogueCategory, FeatureCatalogueHomePageSection } from '../../../services';

// TODO: Bolding the first word/verb won't look write in other languages
const getDescriptionText = ({ description }: FeatureCatalogueEntry): JSX.Element => (
  <EuiText size="s" key={`${description}`}>
    <p>{description}</p>
  </EuiText>
);

const addSpacersBetweenElementsReducer = (
  acc: JSX.Element[],
  element: JSX.Element,
  index: number,
  elements: JSX.Element[]
) => {
  acc.push(element);
  if (index < elements.length - 1) {
    acc.push(<EuiSpacer key={`homeSolutionsPanel__CTASpacer${index}`} size="m" />);
  }
  return acc;
};

const getAppDescriptions = (apps: FeatureCatalogueEntry[]) =>
  apps
    .sort(sortByOrder)
    .map(getDescriptionText)
    .reduce<JSX.Element[]>(addSpacersBetweenElementsReducer, []);

const sortByOrder = (
  { order: orderA = 0 }: FeatureCatalogueEntry,
  { order: orderB = 0 }: FeatureCatalogueEntry
) => orderA - orderB;

interface Props {
  addBasePath: (path: string) => string;
  directories: FeatureCatalogueEntry[];
}

export const SolutionsPanel: FC<Props> = ({ addBasePath, directories }) => {
  const findDirectoriesBySolution = (solutionId: string): FeatureCatalogueEntry[] =>
    directories.filter(
      (directory) =>
        directory.category !== FeatureCatalogueCategory.SOLUTION &&
        directory.homePageSection === FeatureCatalogueHomePageSection.SOLUTION_PANEL &&
        directory.solution === solutionId
    );

  // Find non-Kibana solutions
  const solutions = directories
    .filter(
      (directory) =>
        directory.category === FeatureCatalogueCategory.SOLUTION &&
        directory.homePageSection === FeatureCatalogueHomePageSection.SOLUTION_PANEL &&
        directory.id !== 'kibana'
    )
    .sort(sortByOrder);

  const kibana = directories.find(({ id }) => id === 'kibana');

  const renderSolutionCard = (solution: FeatureCatalogueEntry) => {
    const solutionApps = findDirectoriesBySolution(solution.id);

    return solutionApps.length ? (
      <EuiFlexItem
        key={solution.id}
        className={`homSolutionsSection__container ${
          solution.id === 'kibana' ? 'homSolutionsSection__single' : ''
        }`}
        grow={1}
      >
        <EuiPanel
          paddingSize="none"
          className="homSolutionsSection__panel"
          onClick={createAppNavigationHandler(solution.path)} // TODO: double check this url once enterprise search overview page is available
        >
          <EuiFlexGroup gutterSize="none">
            <EuiFlexItem grow={1} className={`homSolutionsSection__panelHeader`}>
              <SolutionTitle
                iconType={solution.icon}
                title={solution.title}
                subtitle={solution.description}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={1} className="homSolutionsSection__panelDescriptions">
              {getAppDescriptions(solutionApps)}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    ) : null;
  };

  const halfWidthClass = 'homSolutionsSection__multiple';

  return solutions.length || kibana ? (
    <Fragment>
      <EuiFlexGroup className="homSolutionsSection" justifyContent="spaceAround">
        {solutions.length ? (
          <EuiFlexItem grow={1} className={halfWidthClass}>
            <EuiFlexGroup direction="column">{solutions.map(renderSolutionCard)}</EuiFlexGroup>
          </EuiFlexItem>
        ) : null}
        {kibana ? renderSolutionCard(kibana) : null}
      </EuiFlexGroup>

      <EuiHorizontalRule margin="xl" />
      <EuiSpacer size="s" />
    </Fragment>
  ) : (
    <Fragment>
      <EuiSpacer size="xl" />
    </Fragment>
  );
};

import { createElement } from 'react';
import { render } from 'react-dom';
import { TableOne } from '../../components/TableOne/TableOne';
import { filterDataByCountry, filterDataByPurpose, formatNumber } from '../../utils/data';
import { addFilter, addFilterWrapper } from '../../widgets/filters';
import {
  ALTERNATIVE_PURPOSE_TO_FILTER_BY,
  CHANNEL_FIELD,
  COUNTRY_FIELD,
  DEFAULT_COUNTRY,
  PURPOSE_FIELD,
  VALUE_FIELD,
} from '../../utils/constants';

const sumChannelData = (countryData) => {
  const yearData = countryData.filter((item) => item['year'] === '2022');

  return yearData.reduce((acc, data) => {
    return {
      ...acc,
      [data[CHANNEL_FIELD]]: (parseFloat(acc[data[CHANNEL_FIELD]] || 0) + parseFloat(data[VALUE_FIELD] || 0)).toFixed(
        1,
      ),
    };
  }, {});
};

const getRows = (tableData) => {
  const sum = Object.keys(tableData).reduce(
    (_sum, key) => formatNumber(_sum + formatNumber(Number(tableData[key]) || 0)),
    0,
  );

  return Object.keys(tableData)
    .map((dataKey) => {
      return [dataKey, tableData[dataKey], ((tableData[dataKey] / sum) * 100).toFixed(1) || 0];
    })
    .concat([['Total', sum, '100%']]);
};

const renderTable = (data, country, purpose, tableNode) => {
  const rowHeader = ['Channel', '2022', '% Total'];
  const countryData = filterDataByPurpose(
    filterDataByCountry(data, country, COUNTRY_FIELD),
    purpose || 'Reproductive health care and family planning',
    PURPOSE_FIELD,
  );
  const tableData = getRows(sumChannelData(countryData));
  const rows = [rowHeader].concat(tableData);

  render(createElement(TableOne, { rows }), tableNode);
};

const init = (className) => {
  window.DICharts.handler.addChart({
    className,
    echarts: {
      onAdd: (chartNodes) => {
        Array.prototype.forEach.call(chartNodes, (chartNode) => {
          const dichart = new window.DICharts.Chart(chartNode.parentElement);

          /**
           * ECharts - prefix all browsers global with window
           * i.e window.echarts - echarts won't work without it
           *
           * const chart = window.echarts.init(chartNode);
           */

          dichart.showLoading();
          const filterWrapper = addFilterWrapper(chartNode);
          let purposeField;
          let activeCountry = DEFAULT_COUNTRY;
          if (window.DIState) {
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { country, dataOne: data, purpose } = state;
              activeCountry = country;
              if (activeCountry && data) {
                if (!purposeField) {
                  purposeField = addFilter({
                    wrapper: filterWrapper,
                    options: ALTERNATIVE_PURPOSE_TO_FILTER_BY,
                    defaultOption: 'Reproductive health care and family planning',
                    className: 'purpose-code-filter',
                    label: 'Select purpose code',
                  });
                  if (state) {
                    window.DIState.setState({ purpose: 'Reproductive health care and family planning' });
                  }

                  purposeField.addEventListener('change', (event) => {
                    window.DIState.setState({ purpose: event.target.value });
                  });
                }
                renderTable(data, activeCountry, purpose, chartNode);

                dichart.hideLoading();
              }
            });
          } else {
            console.log('State is not defined');
            dichart.hideLoading();
          }
        });
      },
    },
  });
};

export default init;

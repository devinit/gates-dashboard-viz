import { createElement } from 'react';
import { render } from 'react-dom';
import { TableTwo } from '../../components/TableTwo/TableTwo';
import { DEFAULT_COUNTRY, NO_DATA } from '../../utils/constants';
import { filterDataByCountry, formatNumber } from '../../utils/data';
import { addFilter, addFilterWrapper } from '../../widgets/filters';

const DATA_PURPOSE_COLUMN = 'Code type';
const DEFAULT_PURPOSE = 'Reproductive health care and family planning';
const getGroupedData = (countryData) => {
  let iteratorData = [...countryData];
  const sortedData = [];
  if (countryData.length < 10) {
    for (let count = 0; count < countryData.length; count++) {
      if (iteratorData.length >= 1) {
        let maxRow = iteratorData.reduce((prev, current) => {
          if (Number(prev['2022']) < Number(current['2022'])) {
            return current;
          } else {
            return prev;
          }
        });
        sortedData.push(maxRow);
        let maxRowIndex = iteratorData.indexOf(maxRow);
        iteratorData.splice(maxRowIndex, 1);
      }
    }
  }
  for (let count = 0; count < 10; count++) {
    if (iteratorData.length >= 1) {
      let maxRow = iteratorData.reduce((prev, current) => {
        if (Number(prev['2022']) < Number(current['2022'])) {
          return current;
        } else {
          return prev;
        }
      });
      sortedData.push(maxRow);
      let maxRowIndex = iteratorData.indexOf(maxRow);
      iteratorData.splice(maxRowIndex, 1);
    }
  }

  return { sortedData, unsortedData: iteratorData };
};

const sortedDataRows = (data) => {
  const fullRows = [];
  if (data.length < 10) {
    if (data.length === 0) {
      return fullRows;
    }
    for (let i = 0; i < data.length; i++) {
      if (data.length >= 1) {
        fullRows.push([
          i + 1,
          data[i].recipient_name,
          formatNumber(Number(data[i]['2018']), NO_DATA),
          formatNumber(Number(data[i]['2019']), NO_DATA),
          formatNumber(Number(data[i]['2020']), NO_DATA),
          formatNumber(Number(data[i]['2021']), NO_DATA),
          formatNumber(Number(data[i]['2022']), NO_DATA),
        ]);
      }
    }

    return fullRows;
  } else {
    for (let i = 0; i < 10; i++) {
      if (data.length >= 1) {
        fullRows.push([
          i + 1,
          data[i].recipient_name,
          formatNumber(Number(data[i]['2018']), NO_DATA),
          formatNumber(Number(data[i]['2019']), NO_DATA),
          formatNumber(Number(data[i]['2020']), NO_DATA),
          formatNumber(Number(data[i]['2021']), NO_DATA),
          formatNumber(Number(data[i]['2022']), NO_DATA),
        ]);
      }
    }

    return fullRows;
  }
};

const getUnsortedDataRow = (data, years) => {
  return years.map((year) => {
    const sum = data.map((d) => Number(d[year])).reduce((prev, current) => prev + current, 0);

    return formatNumber(sum, NO_DATA);
  });
};

const renderTable = (data, country, purpose, tableNode) => {
  const YEARS = [2018, 2022];
  const yearRange = YEARS[1] - YEARS[0] + 1;
  const count = [];
  for (const key of Array(yearRange).keys()) {
    count.push(key);
  }
  const rowHeader = ['Rank', 'Recipient'].concat(count.map((key) => YEARS[0] + key));
  const purposeData = data.filter((item) => purpose === item[DATA_PURPOSE_COLUMN]);
  const countrySpecificData = filterDataByCountry(purposeData, country, 'donor_name');
  const { sortedData, unsortedData } = getGroupedData(countrySpecificData);
  const unsortedDataSum = getUnsortedDataRow(
    unsortedData,
    count.map((key) => (YEARS[0] + key).toString()),
  );
  const rows = [rowHeader]
    .concat(sortedDataRows(sortedData))
    .concat([['Total of all other recipients'].concat(unsortedDataSum)]);

  render(createElement(TableTwo, { rows }), tableNode);
};

const init = (className) => {
  window.DICharts.handler.addChart({
    className,
    echarts: {
      onAdd: (tableNodes) => {
        Array.prototype.forEach.call(tableNodes, (tableNode) => {
          const dichart = new window.DICharts.Chart(tableNode.parentElement);

          dichart.showLoading();
          const filterWrapper = addFilterWrapper(tableNode);
          let purposeField;
          let activePurpose = DEFAULT_PURPOSE;
          let activeCountry = DEFAULT_COUNTRY;
          if (window.DIState) {
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { country, dataTwo: data } = state;
              activeCountry = country;
              if (activeCountry && data) {
                if (!purposeField) {
                  purposeField = addFilter({
                    wrapper: filterWrapper,
                    options: data.reduce((options, prev) => {
                      const value = prev[DATA_PURPOSE_COLUMN];

                      return value && !options.includes(value) ? options.concat(value) : options;
                    }, []),
                    defaultOption: activePurpose,
                    className: 'purpose-code-filter',
                    label: 'Select purpose code',
                  });
                  purposeField.addEventListener('change', (event) => {
                    activePurpose = event.target.value;
                    renderTable(data, activeCountry, activePurpose, tableNode);
                  });
                }

                renderTable(data, activeCountry, activePurpose, tableNode);

                dichart.hideLoading();
                tableNode.parentElement.classList.add('auto-height');
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

import fetchCSVData from '../../utils/data';
import { addFilter, addFilterWrapper } from '../../widgets/filters';
// import d3 from 'd3'; // eslint-disable-line import/no-unresolved

// Your Code Goes Here i.e. functions

/**
 * Run your code after the page has loaded
 */
const init = (className) => {
  window.DICharts.handler.addChart({
    className,
    d3: {
      onAdd: (chartNodes) => {
        Array.prototype.forEach.call(chartNodes, (chartNode) => {
          const dichart = new window.DICharts.Chart(chartNode.parentElement);
          dichart.showLoading();

          /**
           * ECharts - prefix all browsers global with window
           * i.e window.echarts - echarts won't work without it
           *
           * const chart = window.echarts.init(chartNode);
           */
          const csv = 'https://raw.githubusercontent.com/devinit/di-website-data/main/2024/rh-and-fp-dropdowns.csv';
          fetchCSVData(csv).then((data) => {
            const filterWrapper = addFilterWrapper(chartNode);
            const countryFilter = addFilter({
              wrapper: filterWrapper,
              options: data.map((d) => d.Donors),
              defaultOption: 'United States',
              className: 'country-filter',
              label: 'Select donor',
            });

            if (window.DIState) {
              window.DIState.setState({ country: 'United States' });
            }

            // add event listeners
            countryFilter.addEventListener('change', (event) => {
              const { value } = event.currentTarget;
              if (window.DIState) {
                window.DIState.setState({ country: value });
              }
            });

            dichart.hideLoading();
            chartNode.parentElement.classList.add('auto-height');
          });
        });
      },
    },
  });
};

export default init;

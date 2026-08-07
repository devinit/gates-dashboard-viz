import '../../styles/oecd.css';

import initTableOne from './TableOne';
import initDonorFilter from './DonorFilter';
import initBarChartOne from './BarChartOne';
import initBarChartTwo from './BarChartTwo';
import initTableTwo from './TableTwo';
import initOdaAidTable from './OdaAidTable';
import initOdaChannelsTable from './OdaChannelsTable';
import initOdaChannelsChart from './OdaChannelsChart';
import { fetchCoreData } from '../../utils/data';

// Your Code Goes Here i.e. functions

const init = () => {
  fetchCoreData(
    [
      {
        url: 'https://raw.githubusercontent.com/devinit/di-website-data/main/2024/RH_and_FP_Purpose_code_trends_chart_OECD.csv',
        state: 'dataOne',
      },
      {
        url: 'https://raw.githubusercontent.com/devinit/di-website-data/main/2024/donor_by_recip_2019.csv',
        state: 'dataTwo',
      },
      {
        url: 'https://raw.githubusercontent.com/devinit/di-website-data/main/2024/RH_FP_aid_type_OECD.csv',
        state: 'odaAidType',
      },
      {
        url: 'https://raw.githubusercontent.com/devinit/di-website-data/main/2024/RH_FP_channels_OECD.csv',
        state: 'odaChannels',
      },
    ],
    { country: 'United States' },
  );
  initDonorFilter('dicharts--donor-selector');
  initTableOne('dicharts--table-one');
  initBarChartOne('dicharts--chart-one');
  initBarChartTwo('dicharts--chart-two');
  initTableTwo('dicharts--table-two');
  initOdaAidTable('dicharts--table-three');
  initOdaChannelsTable('dicharts--table-four');
  initOdaChannelsChart('dicharts--chart-three');
};

export default init;


<script>
import {Line} from 'vue-chartjs';

export default {
    name: "Chart",
    extends: Line,
    props: {
        chartData: {
            type: Object,
            default: null,
        },
        chartOptions: {
            type: Object,
            default: null,
        }
    },
    mounted () {
    this.renderChart(this.chartData, this.chartOptions);
  }
}
</script>
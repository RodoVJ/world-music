import { Chart } from "react-google-charts";
import SpotifyPlayer from '../spotifyPlayer/SpotifyPlayer'
import './WorldMap.css';
import React from 'react';

/**
 * Mark country as selected in map 
 * @param {*} chartWrapper 
 * @param {*} data 
 * @returns country selected and updated map data
 */
const changeCountrySelected = (chartWrapper, data) => {
    var country = ''
    var countryNames = {
      0: "Germany",
      1: "United States",
      2: "Brazil",
      3: "Canada",
      4: "France",
      5: "Russia",
      6: "Mexico",
      7: "Australia",
      8: "South Africa",
      9: "China",
      10: 'India',
      11: 'Nigeria',
      12: 'United Kingdom',
      13: 'Colombia',
      14: 'Costa Rica',
      15: 'Spain',
      16: 'Egypt',
      17: 'Jamaica',
      18: 'Bolivia',
      19: 'Poland',
      20: 'Algeria',
      21: 'Italy',
      22: 'Japan',
    };
    const chart = chartWrapper.getChart()
    const selection = chart.getSelection()
  
    var item = null
    for (let i = 0; i < selection.length; i++) {
        if (selection[i].row != null) {
            item = selection[i]
        } 
    }      
  
    if (item.row != null) {
        country = countryNames[item.row];
        // set the rest of the countries to 0 and selected country to 100
        for (let i = 1; i < data.length; i++) {
            if (i === chart.getSelection()[0].row + 1) {
                data[i] = [data[i][0], 100]
            } else {
                data[i] = [data[i][0], 0]
            }
        }
    } 
  
    return [data, country];
}
  
export default class WorldMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            country: "",
            data: [
                ['Country', ''],
                ['Germany', 100],
                ['United States', 100],
                ['Brazil', 100],
                ['Canada', 100],
                ['France', 100],
                ['Russia', 100],
                ['Mexico', 100],
                ['Australia', 100],
                ['South Africa', 100],
                ['China', 100],
                ['India', 100],
                ['Nigeria', 100],
                ['United Kingdom', 100],
                ['Colombia', 100],
                ['Costa Rica', 100],
                ['Spain', 100],
                ['Egypt', 100],
                ['Jamaica', 100],
                ['Bolivia', 100],
                ['Poland', 100],
                ['Algeria', 100],
                ['Italy', 100],
                ['Japan', 100],
            ]
        };
    }

    selectCountry(chartWrapper, data) {
        var new_data, new_country
        [new_data, new_country] =  changeCountrySelected(chartWrapper, data);
        this.setState({data: new_data, country: new_country});
    }

    render() {
        return(
            <div>
                <SpotifyPlayer country={this.state.country}/>
                <div id='map-container'>
                    <Chart
                    width={'100rem'}
                    height={'0px'}
                    chartType="GeoChart"
                    data={this.state.data}
                    options={{
                        legend: 'none', 
                        backgroundColor: 'rgb(26, 26, 26)',
                        colorAxis: {colors: ['#ffe499', '#ffcc00']},
                        datalessRegionColor: '#b3b3b3',
                        tooltip: {trigger: 'none'},
                    }}
                    chartEvents={[
                        {
                            eventName: 'select',
                            callback: ({ chartWrapper }) => {
                            this.selectCountry(chartWrapper, this.state.data);
                            },
                        },
                    ]}
                    rootProps={{ 'data-testid': '1' }}
                    />
                </div>
            </div>
        );
    }
}

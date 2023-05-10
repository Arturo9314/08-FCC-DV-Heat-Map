const dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json' 
const svg  = d3.select('svg')
const tooltip = d3.select('#tooltip')
const legend = d3.select('#legend')
const drawCanvas = (height, width)=>{
    svg.attr('width', width)
    svg.attr('height', height)
}
const drawLegend = (height, width)=>{
    legend.attr('width', width)
    legend.attr('height', height)
}

const generateScales = (values, padding, height, width)=>{
    const minYear = d3.min(values, (item)=>{
        return item['year']
    })
    const maxYear = d3.max(values, (item)=>{
        return item['year']
    })

    const xScale = d3.scaleLinear()
                    .domain([minYear, maxYear + 1])
                    .range([padding, width - padding])
    const yScale = d3.scaleTime()
                    .domain([new Date(0,0,0,0, 0, 0, 0), new Date(0,12,0,0,0,0,0)])
                    .range([padding, height - padding])
    return {xScale, yScale}
}

const drawCells = ( values, baseTemp, xScale, yScale, width, height, padding )=>{

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class','cell')
        .attr('fill', (item) => {
            let roundedTemp = Math.ceil((baseTemp+item['variance'])*10)/10
            if(roundedTemp < 3.9){
                return 'rgb(11, 26, 238)'
            }else if(roundedTemp < 5){
                return 'rgb(69, 106, 238)'
            }else if(roundedTemp < 6.1){
                return 'rgb(132, 157, 249)'
            }else if(roundedTemp <7.2){
                return 'rgb(181, 195, 246)'
            }else if(roundedTemp<8.3){
                return 'rgb(232, 240, 154)'
            }else if(roundedTemp<9.5){
                return 'rgb(242, 242, 16)'
            }else if(roundedTemp<10.6){
                return 'rgb(255, 158, 40)'
            }else if(roundedTemp<11.7){
                return 'rgb(255, 115, 40)'
            }else{
                return 'rgb(236, 4, 35)'
            }
        })
        .attr('data-year', (item) => {
            return item['year']
        })
        .attr('data-month', (item) => {
            return item['month'] - 1
        })
        .attr('data-temp', (item) => {
            return baseTemp + item['variance']
        })
        .attr('height', (item)=> {
            return (height - (2 * padding)) / 12
        })
        .attr('y', (item) => {
            return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
        })
        .attr('width', (item) => {
            let minYear = d3.min(values, (item) => {
                return item['year']
            })
            
            let maxYear = d3.max(values, (item) => {
                return item['year']
            })

            let yearCount = maxYear - minYear

            return (width - (2 * padding)) / yearCount
        })
        .attr('x', (item) => {
            return xScale(item['year'])
        })
        .on('mouseover', function(d,item) {
            const xposition = -80+Number(xScale(item['year']))
            const yposition = -85+Number(yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0)))
            d3.select(this).attr("style", "outline: 2px solid black;")
            const roundedTemp = Math.ceil((baseTemp+item['variance'])*10)/10
            const roundedVariance = Math.ceil((item['variance'])*10)/10
            tooltip.transition()
                .style('visibility', 'visible')
            
            const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ]
            tooltip.text(item['year'] + ' - ' + monthNames[item['month'] -1 ] + '\n' + roundedTemp +'°C\n'+ `${roundedVariance>0?'+ '+roundedVariance:roundedVariance}` +'°C')
            tooltip.style('translate', `${xposition}px ${yposition}px`);
            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', function(item){
            d3.select(this).attr("style", "outline: ")
            tooltip.transition()
                .style('visibility', 'hidden')
        })
}

const generateAxes = ( xScale, yScale, height, padding)=>{
    const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'))
    const yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height-padding) + ')')
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)')
}

const getData = async()=>{
    try {
        const response = await fetch(dataURL)
        const json = await response.json()
        const result = json
        const values = result['monthlyVariance']
        const baseTemp = result['baseTemperature']
        return {values, baseTemp}
    } catch (error) {
        throw new Error(e)        
    }
}

const heatMap = async()=>{
try {
    const {values, baseTemp} = await getData()
    const width = 1315
    const height = 496
    const padding = 80
    drawCanvas(height, width)
    drawLegend(50, 400)
    const {xScale, yScale} = generateScales(values, padding, height, width)
    drawCells ( values, baseTemp, xScale, yScale , width, height, padding)
    generateAxes(xScale, yScale, height, padding)
} catch (error) {
    throw new Error(error)     
}
}

heatMap()
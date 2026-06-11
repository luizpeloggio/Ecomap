import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Rect, Polyline, Text as SvgText, Line, Circle } from 'react-native-svg';
import { MonthClimate } from '@/services/climate-data';
import { useThemeColor } from '@/hooks/use-theme-color';

export function PrecipitationChart({ data }: { data: MonthClimate[] }) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const cardBg = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  const chartHeight = 150;
  const maxVal = Math.max(...data.map((d) => d.precipitation), 350); 
  
  // Subtract 30px (15px padding on each side of the card container) from the measured width
  const chartWidth = Math.max(0, (width || (Dimensions.get('window').width - 32)) - 30);
  const stepX = chartWidth / 12;
  const barWidth = stepX - 4;

  return (
    <View 
      style={[styles.chartContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitle, { color: textColor }]}>Precipitação (Chuva em mm)</Text>
        {activeIndex !== null ? (
          <Text style={[styles.interactiveInfo, { color: '#3498DB' }]}>
            {data[activeIndex].month}: {data[activeIndex].precipitation} mm
          </Text>
        ) : (
          <Text style={[styles.interactiveInfo, { color: subtitleColor }]}>Toque nas barras</Text>
        )}
      </View>

      <Svg width={chartWidth} height={chartHeight}>
        {data.map((item, index) => {
          const x = index * stepX + 2;
          const barHeight = (item.precipitation / maxVal) * (chartHeight - 30);
          const y = chartHeight - 20 - barHeight;
          const isHighlighted = activeIndex === index;

          return (
            <React.Fragment key={`precip-${item.month}`}>
              {/* Highlight background column */}
              {isHighlighted && (
                <Rect
                  x={x - 2}
                  y={0}
                  width={stepX}
                  height={chartHeight - 20}
                  fill={primaryColor}
                  opacity={0.08}
                  rx={4}
                />
              )}

              <Rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill={isHighlighted ? "#1E88E5" : "#3498DB"} 
                opacity={activeIndex !== null && !isHighlighted ? 0.55 : 1}
                rx={3} 
              />
              
              <SvgText 
                x={x + barWidth / 2} 
                y={chartHeight - 5} 
                fontSize="10" 
                fill={isHighlighted ? textColor : subtitleColor} 
                fontWeight={isHighlighted ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.month}
              </SvgText>
              
              {(isHighlighted || activeIndex === null) && (
                <SvgText 
                  x={x + barWidth / 2} 
                  y={y - 5} 
                  fontSize="9" 
                  fill={isHighlighted ? textColor : subtitleColor} 
                  fontWeight={isHighlighted ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {item.precipitation}
                </SvgText>
              )}

              {/* Invisible touch target for this month column */}
              <Rect
                x={x - 2}
                y={0}
                width={stepX}
                height={chartHeight}
                fill="transparent"
                onPress={() => setActiveIndex(active => active === index ? null : index)}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export function TemperatureChart({ data }: { data: MonthClimate[] }) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const cardBg = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  const chartHeight = 150;
  const minTemp = 22;
  const maxTemp = 32;
  const tempRange = maxTemp - minTemp;
  
  // Subtract 30px (15px padding on each side of the card container) from the measured width
  const chartWidth = Math.max(0, (width || (Dimensions.get('window').width - 32)) - 30);
  const drawWidth = chartWidth - 20; // leave 10px on each side so text doesn't clip
  const stepX = drawWidth / 11;
  
  const points = data.map((item, index) => {
    const x = 10 + index * stepX;
    const y = chartHeight - 20 - ((item.temperature - minTemp) / tempRange) * (chartHeight - 40);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View 
      style={[styles.chartContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitle, { color: textColor }]}>Temperatura Média (°C)</Text>
        {activeIndex !== null ? (
          <Text style={[styles.interactiveInfo, { color: '#E74C3C' }]}>
            {data[activeIndex].month}: {data[activeIndex].temperature} °C
          </Text>
        ) : (
          <Text style={[styles.interactiveInfo, { color: subtitleColor }]}>Toque nos pontos</Text>
        )}
      </View>

      <Svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {[24, 26, 28, 30].map(temp => {
          const y = chartHeight - 20 - ((temp - minTemp) / tempRange) * (chartHeight - 40);
          return (
            <React.Fragment key={`grid-${temp}`}>
              <Line x1="10" y1={y} x2={chartWidth - 10} y2={y} stroke={cardBorder} strokeWidth="1" />
              <SvgText x="10" y={y - 5} fontSize="10" fill={subtitleColor}>{temp}°</SvgText>
            </React.Fragment>
          );
        })}

        {/* Vertical dotted guide line for active month */}
        {activeIndex !== null && (() => {
          const x = 10 + activeIndex * stepX;
          return (
            <Line
              x1={x}
              y1={10}
              x2={x}
              y2={chartHeight - 20}
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          );
        })()}

        <Polyline points={points} fill="none" stroke="#E74C3C" strokeWidth="3" />
        
        {data.map((item, index) => {
          const x = 10 + index * stepX;
          const y = chartHeight - 20 - ((item.temperature - minTemp) / tempRange) * (chartHeight - 40);
          const isHighlighted = activeIndex === index;

          return (
            <React.Fragment key={`temp-${item.month}`}>
              {isHighlighted && (
                <Circle cx={x} cy={y} r={8} fill="#E74C3C" opacity={0.3} />
              )}

              <Circle cx={x} cy={y} r={isHighlighted ? 5.5 : 3.5} fill="#E74C3C" />
              
              <SvgText 
                x={x} 
                y={chartHeight - 5} 
                fontSize="10" 
                fill={isHighlighted ? textColor : subtitleColor} 
                fontWeight={isHighlighted ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.month}
              </SvgText>
              
              {(isHighlighted || activeIndex === null) && (
                <SvgText 
                  x={x} 
                  y={y - 8} 
                  fontSize="9" 
                  fill={isHighlighted ? textColor : "#E74C3C"} 
                  fontWeight={isHighlighted ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {item.temperature}
                </SvgText>
              )}

              {/* Invisible vertical slice touch target for this month */}
              <Rect
                x={x - stepX / 2}
                y={0}
                width={stepX}
                height={chartHeight}
                fill="transparent"
                onPress={() => setActiveIndex(active => active === index ? null : index)}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  interactiveInfo: {
    fontSize: 13,
    fontWeight: 'bold',
  }
});

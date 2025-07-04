'use strict';
const formatDate = require('./formatDate');
const colorizerFactory = require('pino-pretty').colorizerFactory;

const messageFormatFactory = (levels, colors, useColors) => {
  let customColors;
  if (colors != null) {
    customColors = Object.entries(colors);
  }
  const colorizer = colorizerFactory(useColors, customColors);

  const levelLookUp = {
    60: colorizer('fatal').toLowerCase(),
    50: colorizer('error').toLowerCase(),
    40: colorizer('warn').toLowerCase(),
    30: colorizer('info').toLowerCase(),
    20: colorizer('debug').toLowerCase(),
    10: colorizer('trace').toLowerCase()
  };

  const shouldAddCustomLevels = !!levels;
  if (shouldAddCustomLevels) {
    Object.entries(levels).forEach(([name, level]) => {
      const customLevels = { [level]: name };
      const customLevelNames = { [name]: level };
      levelLookUp[level] = colorizer(name, {
        customLevelNames,
        customLevels
      }).toLowerCase();
    });
  }
  const colorizeMessage = colorizer.message;

  const messageFormat = (log, messageKey) => {
    const time = formatDate(log.time);
    const level = levelLookUp[log.level];

    let finalLog = log.req
      ? `${time} - ${level} - ${log.req.method} ${log.req.url
      } - ${colorizeMessage(log[messageKey])}`
      : `${time} - ${level} - ${colorizeMessage(log[messageKey])}`;

    if (log.error) {
      let stringifiedError;
      try {
        stringifiedError = JSON.stringify(JSON.parse(log.error), null, 2);
      } catch (e) {
        stringifiedError = log.error;
      }

      finalLog += `\n${colorizeMessage('Error:')}\n${stringifiedError}\n`;
    }

    return finalLog;
  };

  return messageFormat;
};

module.exports = messageFormatFactory;

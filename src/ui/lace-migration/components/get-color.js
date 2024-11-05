const primary = {
  default: '#3D3B39',
  _dark: '#FFFFFF',
};

const secondary = { default: '#FFFFFF', _dark: '#3D3B39' };

export const getColor = (color = 'primary', colorMode) => {
  const isLight = colorMode === 'light';
  switch (color) {
    case 'secondary':
      return isLight ? secondary.default : secondary._dark;
    case 'primary':
      return isLight ? primary.default : primary._dark;
    default:
      return color;
  }
};

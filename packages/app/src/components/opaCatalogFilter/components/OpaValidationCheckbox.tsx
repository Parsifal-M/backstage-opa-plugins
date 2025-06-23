import { useEntityList } from '@backstage/plugin-catalog-react';
import {
  FormControl,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import {
  CustomFilters,
  OpaValidationFilter,
} from '../custom-filters/opaCatalogFilter';

const statusMapping = {
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
} as const;

type ValidationStatus = keyof typeof statusMapping;

export const EntityOpaValidationPicker = () => {
  const {
    filters: { opaValidationStatus },
    updateFilters,
  } = useEntityList<CustomFilters>();

  function onChange(value: ValidationStatus) {
    const newStatus = opaValidationStatus?.values.includes(value)
      ? opaValidationStatus.values.filter(status => status !== value)
      : [...(opaValidationStatus?.values ?? []), value];
    updateFilters({
      opaValidationStatus: newStatus.length
        ? new OpaValidationFilter(newStatus)
        : undefined,
    });
  }

  const statusOptions: ValidationStatus[] = ['info', 'warning', 'error'];

  return (
    <FormControl component="fieldset">
      <Typography variant="button">Validation Status</Typography>
      <FormGroup>
        {statusOptions.map(status => (
          <FormControlLabel
            key={status}
            control={
              <Checkbox
                checked={opaValidationStatus?.values.includes(status)}
                onChange={() => onChange(status)}
              />
            }
            label={`${statusMapping[status]}`}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

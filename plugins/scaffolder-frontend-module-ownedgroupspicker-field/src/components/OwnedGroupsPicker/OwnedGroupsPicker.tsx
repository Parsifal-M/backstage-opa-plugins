import React, { useCallback, useEffect, useState } from 'react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NotFoundError } from '@backstage/errors';
import { GroupEntity } from '../../types';


const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
  },
}));

export const OwnedGroupsPicker = () => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [groups, setGroups] = useState<GroupEntity[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    const fetchUserGroups = async () => {
      const identity = await identityApi.getBackstageIdentity();
      const userIdentity = identity.ownershipEntityRefs;

      if (!userIdentity) {
        throw new NotFoundError(`Could not find owned entities for user ${userIdentity}`);
      }

      const userOwnedGroups = await catalogApi.getEntities({
        filter: {
          kind: 'Group',
          'relations.hasMember': userIdentity
        },
      });
      setGroups(userOwnedGroups.items);
    };

    fetchUserGroups();
  }, [identityApi, catalogApi]);

  const handleChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedGroup(event.target.value as string);
  }, []);

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="user-owned-groups-label">User Owned Groups</InputLabel>
      <Select
        labelId="user-owned-groups-label"
        id="user-owned-groups-select"
        value={selectedGroup}
        onChange={handleChange}
        label="User Owned Groups"
      >
        {groups.length === 0 ? (
          <MenuItem value="" disabled>
            No Matching Groups
          </MenuItem>
        ) : (
          groups.map((group: GroupEntity) => (
            <MenuItem key={group.metadata.name} value={group.metadata.name}>
              {group.metadata.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

/* eslint-disable @backstage/no-undeclared-imports */
import React, { useEffect, useState } from 'react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NotFoundError } from '@backstage/errors';
import { Entity } from '@backstage/catalog-model';


const useStyles = makeStyles({
  dropdown: {
    minWidth: 120,
  },
});

export const OwnedGroupsPicker = () => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [groups, setGroups] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      const backstageIdentity = await identityApi.getBackstageIdentity();
      const ownedEntities = backstageIdentity?.ownershipEntityRefs;
      
      if (!ownedEntities) {
        throw new NotFoundError(`Could not find owned entities for user ${ownedEntities}`);
      }

      const userOwnedGroups = await catalogApi.getEntities({
        filter: {
          kind: 'Group',
          'metadata.owners': ownedEntities,
        },
      });
      setGroups(userOwnedGroups.items);
    };

    fetchUserGroups();
  }, [identityApi, catalogApi]);

  return (
    <TextField
      select
      label="User Owned Groups"
      className={classes.dropdown}
      variant="outlined"
    >
      {groups.map((group: any) => (
        <option key={group.metadata.name} value={group.metadata.name}>
          {group.metadata.name}
        </option>
      ))}
    </TextField>
  );
};

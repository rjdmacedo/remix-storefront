import {Outlet, useOutlet} from '@remix-run/react';

import {Divider, Input, Label, Typography} from '~/components/ui';

export function AccountMain() {
  const outlet = useOutlet();

  return (
    <main className="pt-8 lg:flex-auto lg:pt-0">
      {outlet ? (
        <Outlet />
      ) : (
        <>
          <Typography.Title size="xl">Profile</Typography.Title>
          <Typography.Text size="sm" color="muted-foreground">
            This information will be displayed publicly so be careful what you
            share.
          </Typography.Text>

          <Divider className="py-8" />

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" />
          </div>
        </>
      )}
    </main>
  );
}

import {cn} from '~/lib/utils';

export function Divider({className}: {className?: string}) {
  return (
    <div className={cn(className, 'relative')}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-muted-foreground/50" />
      </div>
    </div>
  );
}

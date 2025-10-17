type EventChipProps = {
  abbr: string;
};

export const EventChip = ({ abbr }: EventChipProps) => {
  return (
    <span className="event-chip bg-accent/80 text-accent-foreground border border-accent/30">
      {abbr}
    </span>
  );
};

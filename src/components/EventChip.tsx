type EventChipProps = {
  abbr: string;
};

export const EventChip = ({ abbr }: EventChipProps) => {
  return <span className="event-chip">{abbr}</span>;
};

import { parseList, type QueryParam } from "@/lib/filter-list";

export function HiddenListInputs({
  name,
  value,
}: {
  name: string;
  value?: QueryParam;
}) {
  return (
    <>
      {parseList(value).map((item) => (
        <input key={`${name}-${item}`} type="hidden" name={name} value={item} />
      ))}
    </>
  );
}

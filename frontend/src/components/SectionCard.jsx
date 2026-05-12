import { Card, CardHeader } from "./ui/Card";

const SectionCard = ({ title, subtitle, action, children }) => (
  <Card className="px-6 py-5">
    <CardHeader title={title} subtitle={subtitle} action={action} />
    <div className="mt-5">{children}</div>
  </Card>
);

export default SectionCard;

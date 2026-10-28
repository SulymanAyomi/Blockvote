import { H3 } from "@/lib/helpers";
import { Btn } from "./btn";
import { Modal } from "./modal";
import { Av } from "./user-avatar";
import { candidateType } from "@/features/elections/type";
import { departmentNameTruncate } from "@/lib/utils";

interface CandidateProfileProps {
  c: candidateType;
  onClose: () => void;
}

export function CandidateProfile({ c, onClose }: CandidateProfileProps) {
  return (
    <Modal
      title={c.voter.fullName}
      description={`${c.voter.department?.name}, ${c.voter.level}`}
      onClose={onClose}
      footer={
        <Btn variant="secondary" onClick={onClose}>
          Close
        </Btn>
      }
    >
      <div className="flex items-center gap-3">
        {c.imageUrl ? (
          <img src={c.imageUrl} className="size-20 rounded-full" />
        ) : (
          <Av name={c.voter.fullName} size="lg" />
        )}
        <div className="text-slate-600">
          <div>
            {c.voter.department?.name &&
              departmentNameTruncate(c.voter.department?.name)}
          </div>
          <div>{c.voter.level}</div>
        </div>
      </div>
      <div>
        <h3 className={H3}>Manifesto</h3>
        <p className="mt-1 text-slate-700">{c.manifesto}</p>
      </div>
      {c.platform && c.platform.length > 0 && (
        <div>
          <h3 className={H3}>Key priorities</h3>
          <ul className="ml-5 mt-1 list-disc space-y-1 text-slate-700">
            {c.platform.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

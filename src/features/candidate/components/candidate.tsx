import { Button } from "@/components/ui/button";
import React from "react";

interface CandidateComponentProps {
  onCancel: () => void;
}
const CandidateComponent = ({ onCancel }: CandidateComponentProps) => {
  return (
    <div className="w-full h-full border-none shadow-none">
      <div className="p-7">
        <h3 className="text-lg mb-4">Candidate Information</h3>
        <div className="w-full h-32 rounded-sm">
          <img src="/img-1.png" className="w-full h-full object-contain" />
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="font-semibold">Badara FoloJata</p>
          <div className="w-fit flex items-center gap-4">
            <img
              src={"/img-3.jpg"}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">CON</p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-primary-col">Profile</p>
          <div className="border-b w-full h-1 my-2"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="font-semibold">Age</p>
              <p className="text-text-color2">50 years old</p>
            </div>

            <div>
              <p className="font-semibold">Socials</p>
              <div></div>
            </div>
          </div>
          <div className="text-sm mt-4">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius, eos!
            A, rerum at, neque, necessitatibus aliquam voluptates quibusdam quia
            quod atque reiciendis animi architecto velit blanditiis ab placeat
            minus quos. Lorem ipsum, dolor sit amet consectetur adipisicing
            elit. Culpa numquam ipsam natus nesciunt inventore quod, facilis
            consequuntur maiores minus earum eligendi laborum provident unde
            quibusdam modi fugit ut asperiores ab! Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Quo alias non voluptas animi
            laboriosam, amet delectus blanditiis quae corrupti pariatur quia
            maxime explicabo dolore ullam minus, magni sunt numquam architecto.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia
            repellendus at numquam est quam voluptas blanditiis, et perspiciatis
            assumenda minus officiis saepe facere iusto nam! Possimus blanditiis
            vero eius accusamus sapiente voluptatem non, recusandae nemo eaque
            saepe dolores quia? Expedita quisquam explicabo numquam eveniet
            reprehenderit exercitationem sint odit quas neque.
          </div>
        </div>
        <Button className="w-full mt-5 " onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CandidateComponent;

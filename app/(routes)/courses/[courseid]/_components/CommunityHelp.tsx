import { MessageCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CommunityHelpProps {
  courseId: string;
}

export const CommunityHelp = ({ courseId }: CommunityHelpProps) => {
  return (
    <Card className=" bg-gray-100 dark:bg-gray-800 border-4 border-gray-800 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] rounded-md ">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-black font-game" />
          <CardTitle className="text-xl">Ask Question in Community</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-black font-game" />
          Need help? Get answers from fellow learners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Join our community to ask questions, share insights, and connect with
          other students taking this course.
        </p>
        <Link href={`/community?course=${courseId}`}>
          <Button className="w-full font-game rounded-md" variant={"pixel"}>
            Go to Community
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

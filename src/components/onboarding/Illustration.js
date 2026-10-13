import JournalIllustration from './illustrations/JournalIllustration';
import MoodIllustration from './illustrations/MoodIllustration';
import LetterIllustration from './illustrations/LetterIllustration';
import ReplyIllustration from './illustrations/ReplyIllustration';

const illustrations = {
    journal: JournalIllustration,
    moods: MoodIllustration,
    letter: LetterIllustration,
    reply: ReplyIllustration,
};

export default function Illustration({ type, colors }) {
    const IllustrationComponent = illustrations[type];

    if (!IllustrationComponent) {
        return null;
    }

    return <IllustrationComponent colors={colors} />;
}

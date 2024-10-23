import { Check, FileSearch } from "lucide-react";

export const BgRadioInputLG = ({
  id,
  label,
  sublabel,
  sidesublabel,
  checked,
  name,
  value,
  onChange,
  disabled = false,
  bgchecked = false,
  extraClass,
  isBondExpired,
}: {
  id: string;
  label: string;
  sublabel?: string;
  sidesublabel?: string;
  name: string;
  value: string | number;
  checked: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  bgchecked?: boolean;
  extraClass?: string;
  isBondExpired?: boolean;
}) => {
  return (
    <label
      htmlFor={id}
      className={`px-2 py-2 w-full transition-colors duration-100 hover:cursor-pointer ${
        checked && bgchecked
          ? "bg-[#EEE9FE]"
          : "border border-borderCol bg-white"
      } rounded-sm flex items-center gap-x-3 mb-2 text-lightGray text-sm ${extraClass}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="accent-primaryCol size-4"
      />
      <div
        className={`w-full ${
          sidesublabel ? "flex flex-row justify-between" : "flex flex-col"
        }`}
      >
        <div className="flex items-center">
          <span className="font-light text-xs">{label}</span>
          {isBondExpired && (
            <div className="bg-[#D9D9D9] border border-[#C6C6C6] px-1 rounded-sm text-[12px] mx-1">
              Expired
            </div>
          )}
        </div>
        {sublabel && (
          <span className="text-[#797979] text-xs font-light">{sublabel}</span>
        )}
        {sidesublabel && (
          <div className="flex">
            <Check className="text-green-300" size={20} />
            <span className="text-[#29C084] text-sm ml-1">
              Your Price: {sidesublabel} P.A
            </span>
          </div>
        )}
      </div>
    </label>
  );
};

export const LcLgInfo = ({
  label,
  value,
  noBorder,
  link,
}: {
  label: string;
  value: string | null;
  noBorder?: boolean;
  link?: string;
}) => {
  return (
    <div
      className={`flex items-start justify-between py-2 ${
        !noBorder && "border-b border-b-borderCol"
      }`}
    >
      <p className="font-roboto text-sm font-normal text-para">{label}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center capitalize font-semibold text-right text-base max-w-[100%] truncate"
        >
          <FileSearch className="mr-2" color="#29C084" /> {value}
        </a>
      ) : (
        <p
          className={`max-w-[60%] text-right text-sm font-semibold capitalize ${
            (label.includes("Expiry") ||
              label.toLowerCase() === "last date for receiving bids") &&
            "text-[#A10909]"
          }`}
        >
          {value || "-"}
        </p>
      )}
    </div>
  );
};

export const getLgBondTotal = (item: any) => {
  const otherBond = item?.otherBond?.cashMargin ?? 0;
  const bidBond = item?.bidBond?.cashMargin ?? 0;
  const advancePaymentBond = item?.advancePaymentBond?.cashMargin ?? 0;
  const performanceBond = item?.performanceBond?.cashMargin ?? 0;
  const retentionMoneyBond = item?.retentionMoneyBond?.cashMargin ?? 0;
  const total =
    otherBond +
    bidBond +
    advancePaymentBond +
    performanceBond +
    retentionMoneyBond;
  return total;
};

export const formatFirstLetterOfWord = (name: string | undefined | null) => {
  if (!name) {
    return ""; // Return an empty string or any default value if name is undefined or null
  }

  const segmenter = new Intl.Segmenter("en", { granularity: "word" });
  const segments = Array.from(segmenter.segment(name));

  let insideParentheses = false;
  let result = "";

  for (let i = 0; i < segments.length; i++) {
    const { segment } = segments[i];
    const trimmedSegment = segment.trim();

    // Check for opening and closing parentheses
    if (trimmedSegment === "(") {
      insideParentheses = true;
      result += "(";
    } else if (trimmedSegment === ")") {
      insideParentheses = false;
      result += ")";
    } else if (trimmedSegment === "") {
      // Preserve spaces
      result += segment;
    } else if (insideParentheses) {
      // Capitalize everything inside parentheses
      result += segment.toUpperCase();
    } else {
      // Original logic for words outside parentheses
      const lowerWord = trimmedSegment.toLowerCase();
      if (["al", "of", "and", "in", "for"].includes(lowerWord)) {
        result += lowerWord;
      } else {
        result += lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
      }
    }
  }

  return result;
};

export const sortBanksAlphabetically = (banks) => {
  return [...banks].sort((a, b) => a.bank.localeCompare(b.bank));
};

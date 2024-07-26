import React, { useEffect, useState } from 'react';
import { DDInput } from '../LCSteps/helpers';
import { LgStepsProps2 } from '@/types/lg';
import { Input } from '../ui/input';

const LgStep2: React.FC<LgStepsProps2> = ({ register, watch, setStepCompleted, data, flags, setValue }) => {

    const country = watch("applicantDetails.country");
    const company = watch("applicantDetails.company");
    const crNumber = watch("applicantDetails.crNumber");

    return (
        <div
            id="lg-step2"
            className="py-3 px-2 border border-borderCol rounded-lg w-full scroll-target"
        >
            <div className="flex items-center gap-x-2 ml-3 mb-3">
                <p className="text-sm size-6 rounded-full bg-primaryCol center text-white font-semibold">
                    2
                </p>
                <p className="font-semibold text-[16px] text-lightGray">
                    Applicant Details
                </p>
            </div>
            <div className='flex items-center gap-3 border border-[#E2E2EA] bg-[#F5F7F9] pt-2 px-2 rounded-lg pb-2'>
                <DDInput
                    placeholder="Select Country"
                    label="Country"
                    id="applicantDetails.country"
                    data={data}
                    setValue={setValue}
                    flags={flags}
                />
                <DDInput
                    placeholder="Select"
                    label="Company"
                    id="applicantDetails.company"
                    data={['Company 1', 'Company 2', 'Company 3']}
                    setValue={setValue}
                />

                <label
                    id="applicantDetails.crNumber"
                    className="border p-1 px-3 rounded-md w-full flex items-center justify-between  bg-white"
                >
                    <p className="w-full text-sm text-lightGray">CR Number</p>
                    <Input
                        register={register}
                        type="text"
                        name='applicantDetails.crNumber'
                        className="block bg-none text-sm text-end border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
                        placeholder="-"
                    />
                </label>
            </div>
        </div>
    )
}

export default LgStep2;

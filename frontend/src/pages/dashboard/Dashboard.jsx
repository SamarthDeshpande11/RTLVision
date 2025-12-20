import PageContainer from "../../components/layout/PageContainer";
export default function Dashboard(){
    return(
        <PageContainer>
            <div className="p-10">
                <h1 className="text-3xl font -bold">RTLVision Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    RTL Simulation,linting & Waveform analysis
                </p>
            </div>
        </PageContainer>
    );
}
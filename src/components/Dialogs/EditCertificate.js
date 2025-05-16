import { use, useEffect } from "react";


const EditCertificate = (props) => {
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        setSelectedCertificate(props.certificate);
    })

    return (
        <Dialog className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
            <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Chỉnh sửa chứng chỉ</h2>
                {selectedCertificate && (
                <form>
                    <div className="mb-4">
                    <label className="block font-medium mb-1">Tên chứng chỉ:</label>
                    <input type="text" className="w-full border rounded px-3 py-2" defaultValue={selectedCertificate.certificateName} />
                    </div>
                    <div className="mb-4">
                    <label className="block font-medium mb-1">Ngày nhận:</label>
                    <input type="date" className="w-full border rounded px-3 py-2" defaultValue={selectedCertificate.receivedDate} />
                    </div>
                    <div className="mb-4">
                    <label className="block font-medium mb-1">Ngày hết hạn:</label>
                    <input type="date" className="w-full border rounded px-3 py-2" defaultValue={selectedCertificate.expirationDate} />
                    </div>
                    <div className="flex justify-end">
                    <Button type="button" variant="outline" >Hủy</Button>
                    <Button type="submit">Lưu</Button>
                    </div>
                </form>
                )}
            </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default EditCertificate
export default interface IApiResponse {
    /**
     * Response status code
     */
    statusCode: number;
    /**
     * Response status label
     */
    status: "success" | "fail" | "error";
    /**
     * Result data
     */
    data: any;
}